import { FFmpeg, FFFSType } from '@ffmpeg/ffmpeg'
import { getFileExtension, getPreviewMimeType } from './validation'
import type { AudioAnalysis, ProbeResult, ProbeStream } from '../types'

const LOAD_TIMEOUT_MS = 20_000
const BROWSER_METADATA_TIMEOUT_MS = 5_000
const DEFAULT_FFMPEG_CORE_BASE_URL =
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
const FFMPEG_CORE_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_FFMPEG_CORE_BASE_URL || DEFAULT_FFMPEG_CORE_BASE_URL,
)

type ProgressHandler = (progress: number) => void
type GeneratedBlob = {
  blob: Blob
  name: string
  probe: ProbeResult
}
type BrowserMetadata = {
  durationSeconds: number | null
  width: number | null
  height: number | null
}

class BrowserMediaEngine {
  private ffmpeg = new FFmpeg()
  private loadingPromise: Promise<void> | null = null

  async load() {
    if (this.ffmpeg.loaded) {
      return
    }

    if (!this.loadingPromise) {
      this.loadingPromise = this.loadCore()
    }

    await this.loadingPromise
  }

  private async loadCore() {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS)

    try {
      const [coreURL, wasmURL] = await Promise.all([
        createBlobUrl(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
          'text/javascript',
          controller.signal,
        ),
        createBlobUrl(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
          'application/wasm',
          controller.signal,
        ),
      ])

      await this.ffmpeg.load(
        {
          coreURL,
          wasmURL,
        },
        { signal: controller.signal },
      )
      await this.ensureDir('/work')
    } catch (error) {
      this.ffmpeg.terminate()

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(
          'The local engine took too long to start. Refresh the page and try again.',
        )
      }

      if (typeof error === 'string') {
        throw new Error(`Could not start the local engine: ${error}`)
      }

      if (error instanceof Error) {
        throw new Error(`Could not start the local engine: ${error.message}`)
      }

      throw new Error('Could not start the local engine.')
    } finally {
      window.clearTimeout(timeoutId)
      this.loadingPromise = null
    }
  }

  async probe(file: File) {
    await this.load()

    const browserMetadata = await readBrowserMetadata(file)

    return this.withMountedInput(file, async (inputPath) => {
      const probe = await this.probeMountedInput(inputPath)
      return mergeBrowserMetadata(probe, browserMetadata, file)
    })
  }

  async analyze(file: File) {
    await this.load()

    return this.withMountedInput(file, async (inputPath) => {
      const jsonLines: string[] = []
      let collecting = false

      const handleLog = ({ message }: { message: string }) => {
        const cleaned = message.replace(/^\[[^\]]+\]\s*/, '').trim()

        if (!collecting && cleaned.startsWith('{')) {
          collecting = true
        }

        if (collecting) {
          jsonLines.push(cleaned)
          if (cleaned.endsWith('}')) {
            collecting = false
          }
        }
      }

      this.ffmpeg.on('log', handleLog)

      try {
        const exitCode = await this.ffmpeg.exec([
          '-i',
          inputPath,
          '-map',
          '0:a:0',
          '-af',
          'loudnorm=I=-16:TP=-1.0:LRA=11:print_format=json',
          '-f',
          'null',
          '-',
        ])

        if (exitCode !== 0) {
          throw new Error('Could not analyze the audio with exact precision.')
        }
      } finally {
        this.ffmpeg.off('log', handleLog)
      }

      const payload = JSON.parse(jsonLines.join('\n')) as {
        input_i: string
        input_tp: string
        input_lra: string
        input_thresh: string
      }

      return {
        integratedLufs: Number.parseFloat(payload.input_i),
        truePeakDbtp: Number.parseFloat(payload.input_tp),
        loudnessRange: Number.parseFloat(payload.input_lra),
        threshold: Number.parseFloat(payload.input_thresh),
      } satisfies AudioAnalysis
    })
  }

  async exportAdjustedFile(file: File, gainDb: number, onProgress?: ProgressHandler) {
    return this.renderAdjustedAsset(file, gainDb, onProgress)
  }

  private async renderAdjustedAsset(
    file: File,
    gainDb: number,
    onProgress?: ProgressHandler,
  ) {
    await this.load()

    const extension = getFileExtension(file.name) || 'mp4'
    const fileStem = file.name.replace(/\.[^.]+$/, '')
    const outputName = `${fileStem}-audio-lift.${extension}`
    const outputPath = `/work/${outputName}`

    return this.withMountedInput(file, async (inputPath) => {
      await this.safeDeleteFile(outputPath)
      const inputProbe = await this.probeMountedInput(inputPath)
      const videoStream = inputProbe.streams.find(
        (stream) => stream.codec_type === 'video',
      )
      const shouldForceHvc1 =
        videoStream?.codec_name === 'hevc' ||
        videoStream?.codec_tag_string === 'hev1' ||
        videoStream?.codec_tag_string === 'hvc1'

      const handleProgress = ({ progress }: { progress: number }) => {
        onProgress?.(progress)
      }

      this.ffmpeg.on('progress', handleProgress)

      try {
        const args = [
          '-i',
          inputPath,
          '-map',
          '0:v:0',
          '-map',
          '0:a:0',
          '-map_metadata',
          '0',
          '-map_chapters',
          '0',
          '-c:v',
          'copy',
          ...(shouldForceHvc1 ? ['-tag:v', 'hvc1'] : []),
          '-af',
          `volume=${gainDb.toFixed(1)}dB`,
          '-c:a',
          'aac',
          '-movflags',
          '+faststart',
          outputPath,
        ]

        const exitCode = await this.ffmpeg.exec(args)

        if (exitCode !== 0) {
          throw new Error(
            'Cannot export with the original video codec in this version. Try another compatible file.',
          )
        }

        const outputProbe = await this.probeMountedInput(outputPath)
        const outputVideoStream = outputProbe.streams.find(
          (stream) => stream.codec_type === 'video',
        )

        if (outputVideoStream?.codec_name !== videoStream?.codec_name) {
          throw new Error(
            'The output did not preserve the original video codec. A misleading file will not be generated.',
          )
        }

        const bytes = await this.ffmpeg.readFile(outputPath)
        await this.safeDeleteFile(outputPath)

        if (!(bytes instanceof Uint8Array)) {
          throw new Error('The exported output could not be read correctly.')
        }

        const arrayBuffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer

        return {
          blob: new Blob([arrayBuffer], { type: getPreviewMimeType(file) }),
          name: outputName,
          probe: outputProbe,
        } satisfies GeneratedBlob
      } finally {
        this.ffmpeg.off('progress', handleProgress)
        onProgress?.(0)
      }
    })
  }

  private async withMountedInput<T>(
    file: File,
    task: (inputPath: string) => Promise<T>,
  ) {
    const inputName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const mountDir = `/work/input-${crypto.randomUUID()}`
    const mountedInputPath = `${mountDir}/${inputName}`

    try {
      await this.ensureDir(mountDir)
      await this.ffmpeg.mount(
        FFFSType.WORKERFS,
        { blobs: [{ name: inputName, data: file }] },
        mountDir,
      )

      try {
        return await task(mountedInputPath)
      } finally {
        await this.safeUnmount(mountDir)
        await this.safeDeleteDir(mountDir)
      }
    } catch {
      const inputPath = `/work/input-${crypto.randomUUID()}-${inputName}`
      const bytes = new Uint8Array(await file.arrayBuffer())
      await this.safeDeleteFile(inputPath)
      await this.ffmpeg.writeFile(inputPath, bytes)

      try {
        return await task(inputPath)
      } finally {
        await this.safeDeleteFile(inputPath)
      }
    }
  }

  private async ensureDir(path: string) {
    try {
      await this.ffmpeg.createDir(path)
    } catch {
      // no-op
    }
  }

  private async probeMountedInput(inputPath: string) {
    return this.probeFromFfmpegLogs(inputPath)
  }

  private async probeFromFfmpegLogs(inputPath: string) {
    const logLines: string[] = []
    const handleLog = ({ message }: { message: string }) => {
      logLines.push(message)
    }
    let execError: unknown = null

    this.ffmpeg.on('log', handleLog)

    try {
      await this.ffmpeg.exec(['-hide_banner', '-i', inputPath])
    } catch (error) {
      execError = error
    } finally {
      this.ffmpeg.off('log', handleLog)
    }

    const result = parseProbeLogs(logLines)

    if (result.streams.length > 0 || result.format.duration) {
      return result
    }

    if (execError instanceof Error) {
      throw new Error(`Could not read file metadata. ${execError.message}`)
    }

    throw new Error('Could not read file metadata.')
  }

  private async safeDeleteFile(path: string) {
    try {
      await this.ffmpeg.deleteFile(path)
    } catch {
      // no-op
    }
  }

  private async safeDeleteDir(path: string) {
    try {
      await this.ffmpeg.deleteDir(path)
    } catch {
      // no-op
    }
  }

  private async safeUnmount(path: string) {
    try {
      await this.ffmpeg.unmount(path)
    } catch {
      // no-op
    }
  }

}

export const browserMediaEngine = new BrowserMediaEngine()

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

async function createBlobUrl(
  sourceUrl: string,
  mimeType: string,
  signal: AbortSignal,
) {
  const response = await fetch(sourceUrl, { signal })

  if (!response.ok) {
    throw new Error(`Could not download ${sourceUrl} (${response.status}).`)
  }

  const buffer = await response.arrayBuffer()
  return URL.createObjectURL(new Blob([buffer], { type: mimeType }))
}

function readBrowserMetadata(file: File) {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')

  video.preload = 'metadata'

  return new Promise<BrowserMetadata>((resolve, reject) => {
    let isSettled = false

    const cleanup = () => {
      window.clearTimeout(timeoutId)
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(objectUrl)
    }

    const timeoutId = window.setTimeout(() => {
      if (isSettled) {
        return
      }

      isSettled = true
      cleanup()
      reject(
        new Error(
          'The browser took too long to read the video metadata. Try another file or re-export the video from your gallery/camera.',
        ),
      )
    }, BROWSER_METADATA_TIMEOUT_MS)

    video.onloadedmetadata = () => {
      if (isSettled) {
        return
      }

      isSettled = true
      const durationSeconds = Number.isFinite(video.duration) ? video.duration : null
      const width = video.videoWidth > 0 ? video.videoWidth : null
      const height = video.videoHeight > 0 ? video.videoHeight : null

      cleanup()
      resolve({ durationSeconds, width, height })
    }

    video.onerror = () => {
      if (isSettled) {
        return
      }

      isSettled = true
      cleanup()
      reject(
        new Error(
          'The browser could not read the video metadata. Try another compatible file or re-export it from your gallery/camera.',
        ),
      )
    }

    video.src = objectUrl
  })
}

function mergeBrowserMetadata(
  probe: ProbeResult,
  browserMetadata: BrowserMetadata,
  file: Pick<File, 'size'>,
): ProbeResult {
  const probeDuration = Number.parseFloat(probe.format.duration ?? '')

  if (
    Number.isFinite(probeDuration) &&
    browserMetadata.durationSeconds !== null &&
    Math.abs(probeDuration - browserMetadata.durationSeconds) >
      Math.max(2, browserMetadata.durationSeconds * 0.1)
  ) {
    throw new Error(
      'Could not confirm consistent video metadata. The file may have corrupted or non-standard metadata.',
    )
  }

  const duration =
    Number.isFinite(probeDuration) && probeDuration > 0
      ? probe.format.duration
      : browserMetadata.durationSeconds !== null
        ? String(browserMetadata.durationSeconds)
        : probe.format.duration

  const streams = mergeBrowserVideoStream(probe.streams, browserMetadata)

  return {
    streams,
    format: {
      ...probe.format,
      duration,
      size: probe.format.size ?? String(file.size),
    },
  }
}

function mergeBrowserVideoStream(
  streams: ProbeStream[],
  browserMetadata: BrowserMetadata,
) {
  const browserDuration =
    browserMetadata.durationSeconds !== null ? String(browserMetadata.durationSeconds) : undefined
  const videoStream = streams.find((stream) => stream.codec_type === 'video')

  if (!videoStream && (browserMetadata.width || browserMetadata.height)) {
    const nextIndex =
      streams.reduce((highest, stream) => Math.max(highest, stream.index), -1) + 1

    return [
      ...streams,
      {
        index: nextIndex,
        codec_type: 'video',
        width: browserMetadata.width ?? undefined,
        height: browserMetadata.height ?? undefined,
        duration: browserDuration,
      },
    ]
  }

  return streams.map((stream) => {
    if (stream.codec_type !== 'video') {
      return stream
    }

    return {
      ...stream,
      width: stream.width ?? browserMetadata.width ?? undefined,
      height: stream.height ?? browserMetadata.height ?? undefined,
      duration: stream.duration ?? browserDuration,
    }
  })
}

function parseProbeLogs(logLines: string[]): ProbeResult {
  const lines = logLines.map((line) => line.trim()).filter(Boolean)
  const streams = lines.flatMap(parseStreamLine)
  const formatName = parseFormatName(lines)
  const durationSeconds = parseDurationSeconds(lines)

  return {
    format: {
      format_name: formatName ?? undefined,
      duration: durationSeconds ? String(durationSeconds) : undefined,
      size: undefined,
    },
    streams,
  }
}

function parseStreamLine(line: string) {
  if (!line.includes('Stream #')) {
    return []
  }

  const indexMatch = line.match(/Stream #\d+:(\d+)/)
  const codecTag = parseCodecTag(line)
  const durationMatch = line.match(/duration[:=]\s*([0-9.]+)/i)
  const index = Number.parseInt(indexMatch?.[1] ?? '', 10)

  if (!Number.isFinite(index)) {
    return []
  }

  if (line.includes(' Audio: ')) {
    const codecMatch = line.match(/Audio:\s*([^,\s]+)/)
    const sampleRateMatch = line.match(/,\s*(\d+)\s*Hz/i)
    const channels = line.includes('stereo') ? 2 : line.includes('mono') ? 1 : undefined
    const bitRate = parseStreamBitRate(line)

    return [
      {
        index,
        codec_type: 'audio',
        codec_name: codecMatch?.[1],
        codec_tag_string: codecTag,
        duration: durationMatch?.[1],
        sample_rate: sampleRateMatch?.[1],
        channels,
        bit_rate: bitRate ? String(bitRate) : undefined,
      },
    ]
  }

  if (line.includes(' Video: ')) {
    const codecMatch = line.match(/Video:\s*([^,\s]+)/)
    const pixelFormatMatch = line.match(/Video:\s*[^,]+,\s*([^,\s(]+)/)
    const dimensionsMatch = line.match(/,\s*(\d+)x(\d+)[,\s]/)
    const fpsMatch = line.match(/,\s*([0-9.]+)\s*fps/i)

    return [
      {
        index,
        codec_type: 'video',
        codec_name: codecMatch?.[1],
        codec_tag_string: codecTag,
        width: dimensionsMatch ? Number.parseInt(dimensionsMatch[1], 10) : undefined,
        height: dimensionsMatch ? Number.parseInt(dimensionsMatch[2], 10) : undefined,
        duration: durationMatch?.[1],
        avg_frame_rate: fpsMatch ? `${fpsMatch[1]}/1` : undefined,
        r_frame_rate: fpsMatch ? `${fpsMatch[1]}/1` : undefined,
        pix_fmt: pixelFormatMatch?.[1],
      },
    ]
  }

  if (line.includes(' Data: ')) {
    return [
      {
        index,
        codec_type: 'data',
        codec_tag_string: codecTag,
      },
    ]
  }

  return []
}

function parseCodecTag(line: string) {
  return (
    line.match(/\(([a-zA-Z0-9]{4})\s+\//)?.[1] ??
    line.match(/\[([a-zA-Z0-9]{4})\]/)?.[1] ??
    undefined
  )
}

function parseStreamBitRate(line: string) {
  const match = line.match(/,\s*([0-9]+(?:\.[0-9]+)?)\s*kb\/s\b/i)

  if (!match) {
    return null
  }

  const kilobitsPerSecond = Number.parseFloat(match[1])

  if (!Number.isFinite(kilobitsPerSecond) || kilobitsPerSecond <= 0) {
    return null
  }

  return Math.round(kilobitsPerSecond * 1000)
}

function parseFormatName(lines: string[]) {
  const inputLine = lines.find((line) => line.startsWith('Input #'))
  const match = inputLine?.match(/^Input #\d+,\s*([^,]+(?:,[^,]+)*?),\s*from /)

  return match?.[1]
}

function parseDurationSeconds(lines: string[]) {
  const durationLine = lines.find((line) => line.includes('Duration:'))
  const match = durationLine?.match(/Duration:\s*(\d+):(\d+):([0-9.]+)/)

  if (!match) {
    return null
  }

  const hours = Number.parseFloat(match[1])
  const minutes = Number.parseFloat(match[2])
  const seconds = Number.parseFloat(match[3])

  if (![hours, minutes, seconds].every(Number.isFinite)) {
    return null
  }

  return hours * 3600 + minutes * 60 + seconds
}

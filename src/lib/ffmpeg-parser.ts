import type { ProbeResult, ProbeStream } from '../types'

export function parseProbeLogs(logLines: string[]): ProbeResult {
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

function parseStreamLine(line: string): ProbeStream[] {
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

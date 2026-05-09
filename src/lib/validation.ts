import {
  BASS_EQ_MAX_DB,
  MAX_DURATION_SECONDS,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_VIDEO_CODECS,
  VIRTUAL_BASS_MAX_DB,
} from './constants'
import { formatBytes } from './formatters'
import { TRUE_PEAK_TARGET_DBTP } from './virtualBass'
import type {
  AudioAnalysis,
  AudioState,
  BrowserPlaybackSupport,
  DerivedAnalysis,
  MarginLabel,
  MediaSummary,
  MobileRenderWarning,
  ProbeResult,
  ValidationIssue,
} from '../types'

const MOBILE_RENDER_WARNING_SECONDS = 100
const MOBILE_RENDER_CRITICAL_SECONDS = 150
const LIMITER_WARNING_THRESHOLD_DBTP = TRUE_PEAK_TARGET_DBTP - 1

export function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? '' : ''
}

export function validateSelectedFile(file: File): ValidationIssue | null {
  const extension = getFileExtension(file.name)

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return {
      code: 'unsupported-format',
      message: 'Unsupported format. Only MP4 and MOV are accepted in this version.',
      canRecover: true,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: 'file-too-large',
      message: `The selected file is ${formatBytes(file.size)}, which exceeds the ${formatBytes(MAX_FILE_SIZE_BYTES)} limit.`,
      canRecover: true,
    }
  }

  return null
}

export function buildMediaSummary(
  probe: ProbeResult,
  file: Pick<File, 'name' | 'size'>,
): MediaSummary {
  const extension = getFileExtension(file.name) || 'mp4'
  const videoStream = probe.streams.find((stream) => stream.codec_type === 'video')
  const audioStream = probe.streams.find((stream) => stream.codec_type === 'audio')
  const durationSeconds = getDurationSeconds(probe, videoStream?.duration, audioStream?.duration)
  const frameRate = getFrameRate(videoStream?.avg_frame_rate, videoStream?.r_frame_rate)
  const bitrate =
    durationSeconds > 0 ? Math.round((file.size * 8) / durationSeconds) : null
  const audioSampleRate = audioStream?.sample_rate
    ? Number.parseInt(audioStream.sample_rate, 10)
    : null
  const audioBitrate = audioStream?.bit_rate
    ? Number.parseInt(audioStream.bit_rate, 10)
    : null

  return {
    container: extension,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    sizeBytes: file.size,
    hasAudio: Boolean(audioStream),
    videoCodec: normaliseVideoCodec(videoStream?.codec_name ?? videoStream?.codec_tag_string),
    videoCodecTag: videoStream?.codec_tag_string ?? null,
    audioCodec: normaliseAudioCodec(audioStream?.codec_name ?? audioStream?.codec_tag_string),
    audioCodecTag: audioStream?.codec_tag_string ?? null,
    width: videoStream?.width ?? null,
    height: videoStream?.height ?? null,
    frameRate,
    bitrate,
    audioSampleRate: Number.isFinite(audioSampleRate) ? audioSampleRate : null,
    audioChannels: audioStream?.channels ?? null,
    audioBitrate: Number.isFinite(audioBitrate) ? audioBitrate : null,
  }
}

export function getBlockingIssue(summary: MediaSummary): ValidationIssue | null {
  if (summary.durationSeconds > MAX_DURATION_SECONDS) {
    return {
      code: 'video-too-long',
      message: 'The video exceeds the maximum allowed duration of 3 minutes.',
      canRecover: true,
    }
  }

  if (!summary.hasAudio) {
    return {
      code: 'missing-audio',
      message: 'This video has no audio to process.',
      canRecover: true,
    }
  }

  if (!summary.videoCodec || !SUPPORTED_VIDEO_CODECS.has(summary.videoCodec)) {
    return {
      code: 'unsupported-video-codec',
      message:
        'The video codec is not supported in this version. Only H.264 and HEVC are guaranteed.',
      canRecover: false,
    }
  }

  return null
}

export function buildDerivedAnalysis(
  analysis: AudioAnalysis,
  gainDb: number,
  bassEqDb: number,
  virtualBassDb: number,
): DerivedAnalysis {
  const bassEqContributionDb = (bassEqDb / BASS_EQ_MAX_DB) * 4
  const virtualBassContributionDb = (virtualBassDb / VIRTUAL_BASS_MAX_DB) * 3
  const processingActive = gainDb > 0 || bassEqDb > 0 || virtualBassDb > 0
  const projectedTruePeakDbtp =
    analysis.truePeakDbtp + gainDb + bassEqContributionDb + virtualBassContributionDb
  const exceedsTruePeakHeadroom = projectedTruePeakDbtp > TRUE_PEAK_TARGET_DBTP
  const limiterLikelyRequired =
    processingActive &&
    projectedTruePeakDbtp > LIMITER_WARNING_THRESHOLD_DBTP &&
    !exceedsTruePeakHeadroom
  const audioState = classifyAudioState(analysis.integratedLufs)

  return {
    gainDb,
    bassEqDb,
    virtualBassDb,
    processingActive,
    projectedTruePeakDbtp,
    exceedsTruePeakHeadroom,
    limiterLikelyRequired,
    audioState,
    audioStateLabel: getAudioStateLabel(audioState),
    marginLabel: getMarginLabel(analysis.truePeakDbtp),
  }
}

export function getFeedbackMessages(
  analysis: AudioAnalysis | null,
  derived: DerivedAnalysis | null,
) {
  if (!analysis || !derived) {
    return []
  }

  const messages: string[] = []

  if (derived.exceedsTruePeakHeadroom) {
    messages.push('Projected true peak exceeds the -1 dBTP safety target.')
  }

  if (derived.gainDb > 0) {
    messages.push(
      derived.limiterLikelyRequired || derived.exceedsTruePeakHeadroom
        ? 'Positive gain is pushing the master close to the -1 dBTP target.'
        : 'Positive gain is active. Current projected headroom remains within target.',
    )
  }

  if (derived.bassEqDb > 0) {
    messages.push(
      derived.limiterLikelyRequired || derived.exceedsTruePeakHeadroom
        ? 'Bass EQ is reducing available headroom in the low band.'
        : 'Bass EQ is active and focused on low-band body.',
    )
  }

  if (derived.virtualBassDb > 0) {
    messages.push(
      derived.limiterLikelyRequired || derived.exceedsTruePeakHeadroom
        ? 'Virtual Bass may increase limiter activity through harmonic synthesis.'
        : 'Virtual Bass is active through harmonic synthesis while projected headroom remains within target.',
    )
  }

  if (
    analysis.truePeakDbtp > TRUE_PEAK_TARGET_DBTP &&
    !messages.includes('Projected true peak exceeds the -1 dBTP safety target.')
  ) {
    messages.push('The source master already sits above the -1 dBTP safety target.')
  }

  return messages
}

export function getMobileRenderWarning(
  summary: MediaSummary | null,
  shouldWarnForMobile: boolean,
): MobileRenderWarning | null {
  if (!summary || !shouldWarnForMobile) {
    return null
  }

  if (summary.durationSeconds >= MOBILE_RENDER_CRITICAL_SECONDS) {
    return {
      level: 'critical',
      title: 'Long iPhone Render',
      detail:
        'This video is long for a mobile export session. iPhone rendering may use significant memory and take longer than usual.',
    }
  }

  if (summary.durationSeconds >= MOBILE_RENDER_WARNING_SECONDS) {
    return {
      level: 'warning',
      title: 'Mobile Render Warning',
      detail:
        'This video is long enough to make iPhone rendering heavier. Export remains available, but processing may take longer.',
    }
  }

  return null
}

export function getPreviewMimeType(file: File | null) {
  if (!file) {
    return 'video/mp4'
  }

  return getFileExtension(file.name) === 'mov' ? 'video/quicktime' : 'video/mp4'
}

export async function assessBrowserPlaybackSupport(
  summary: MediaSummary,
): Promise<BrowserPlaybackSupport> {
  const mimeTypes = getMimeTypesForContainer(summary.container)
  const codecType = getBrowserCodecString(summary)
  const video = document.createElement('video')
  const candidates = mimeTypes.map((mimeType) => {
    const contentType = codecType
      ? `${mimeType}; codecs="${codecType}"`
      : mimeType

    return {
      mimeType,
      contentType,
      canPlayType:
        video.canPlayType(contentType) || video.canPlayType(mimeType),
    }
  })

  const preferredCandidate =
    candidates.find((candidate) => candidate.canPlayType === 'probably') ??
    candidates.find((candidate) => candidate.canPlayType === 'maybe') ??
    candidates[0]

  const mimeType = preferredCandidate?.mimeType ?? mimeTypes[0] ?? 'video/mp4'
  const canPlayType = preferredCandidate?.canPlayType ?? ''
  const mediaCapabilitiesContentType = getMediaCapabilitiesContentType(summary, mimeType)
  const mediaCapabilities = mediaCapabilitiesContentType
    ? await getMediaCapabilities(summary, mediaCapabilitiesContentType)
    : undefined

  if (mediaCapabilities?.supported) {
    const efficiency = mediaCapabilities.powerEfficient
      ? 'efficient decoding'
      : 'decoding not marked as efficient'

    return {
      status: 'supported',
      label: 'Compatible with this browser',
      detail: `MediaCapabilities confirms support for ${summary.videoCodec ?? 'this video'} with ${efficiency}.`,
      mimeType,
      canPlayType,
      mediaCapabilities,
    }
  }

  if (canPlayType === 'probably') {
    return {
      status: 'likely',
      label: 'Probably compatible',
      detail:
        'The browser indicates probable playback, but MediaCapabilities could not confirm precisely.',
      mimeType,
      canPlayType,
      mediaCapabilities,
    }
  }

  if (canPlayType === 'maybe') {
    return {
      status: 'unknown',
      label: 'Compatible with manual verification',
      detail:
        'The browser only indicates possible compatibility. Confirm playback and live preview behavior before exporting.',
      mimeType,
      canPlayType,
      mediaCapabilities,
    }
  }

  if (summary.videoCodec === 'HEVC') {
    return {
      status: 'unsupported',
      label: 'HEVC not verified in this browser',
      detail:
        'This device/browser does not confirm HEVC decoding. On desktop Chrome, it may depend on the system, hardware, or extensions.',
      mimeType,
      canPlayType,
      mediaCapabilities,
    }
  }

  return {
    status: 'unknown',
    label: 'Compatibility not confirmed',
    detail:
      'The file passes technical validation, but the browser did not confirm playback. Use live playback as a final verification before exporting.',
    mimeType,
    canPlayType,
    mediaCapabilities,
  }
}


function getMimeTypesForContainer(container: string) {
  if (container.toLowerCase() === 'mov') {
    return ['video/quicktime', 'video/mp4']
  }

  return ['video/mp4']
}

function getBrowserCodecString(summary: MediaSummary) {
  const videoCodec = summary.videoCodecTag?.toLowerCase()
  const audioCodec = summary.audioCodecTag?.toLowerCase()

  const normalizedVideoCodec =
    summary.videoCodec === 'H.264'
      ? videoCodec && ['avc1', 'avc3'].includes(videoCodec)
        ? videoCodec
        : 'avc1'
      : summary.videoCodec === 'HEVC'
        ? videoCodec && ['hvc1', 'hev1'].includes(videoCodec)
          ? videoCodec
          : 'hvc1'
        : null

  const normalizedAudioCodec =
    summary.audioCodec === 'AAC'
      ? audioCodec === 'mp4a'
        ? 'mp4a.40.2'
        : 'mp4a.40.2'
      : null

  return [normalizedVideoCodec, normalizedAudioCodec].filter(Boolean).join(', ')
}

function getMediaCapabilitiesContentType(summary: MediaSummary, mimeType: string) {
  const videoCodec = summary.videoCodecTag?.toLowerCase()

  if (!videoCodec?.includes('.')) {
    return null
  }

  return `${mimeType}; codecs="${videoCodec}"`
}

async function getMediaCapabilities(
  summary: MediaSummary,
  contentType: string,
) {
  if (
    !navigator.mediaCapabilities ||
    !summary.width ||
    !summary.height ||
    !summary.frameRate ||
    !summary.bitrate
  ) {
    return undefined
  }

  try {
    const result = await navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: {
        contentType,
        width: summary.width,
        height: summary.height,
        bitrate: summary.bitrate,
        framerate: summary.frameRate,
      },
    })

    return {
      supported: result.supported,
      smooth: result.smooth,
      powerEfficient: result.powerEfficient,
    }
  } catch {
    return undefined
  }
}

function normaliseVideoCodec(codecName?: string | null) {
  if (!codecName) {
    return null
  }

  const normalized = codecName.toLowerCase()

  if (normalized === 'h264' || normalized === 'avc1') {
    return 'H.264'
  }

  if (
    normalized === 'hevc' ||
    normalized === 'h265' ||
    normalized === 'hev1' ||
    normalized === 'hvc1'
  ) {
    return 'HEVC'
  }

  return codecName
}

function normaliseAudioCodec(codecName?: string | null) {
  if (!codecName) {
    return null
  }

  const normalized = codecName.toLowerCase()

  if (normalized === 'aac' || normalized === 'mp4a') {
    return 'AAC'
  }

  if (normalized === 'mp3') {
    return 'MP3'
  }

  return codecName.toUpperCase()
}

function getDurationSeconds(
  probe: ProbeResult,
  videoDuration?: string,
  audioDuration?: string,
) {
  const candidates = [probe.format.duration, videoDuration, audioDuration]

  for (const candidate of candidates) {
    const value = Number.parseFloat(candidate ?? '')
    if (Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return 0
}

function getFrameRate(avgFrameRate?: string, rFrameRate?: string) {
  const candidates = [avgFrameRate, rFrameRate]

  for (const candidate of candidates) {
    const value = parseRatio(candidate)
    if (value && Number.isFinite(value) && value > 0) {
      return Number(value.toFixed(2))
    }
  }

  return null
}

function parseRatio(value?: string) {
  if (!value) {
    return null
  }

  const [rawNumerator, rawDenominator] = value.split('/')
  const numerator = Number.parseFloat(rawNumerator ?? '')
  const denominator = Number.parseFloat(rawDenominator ?? '')

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return null
  }

  if (denominator === 0) {
    return null
  }

  return numerator / denominator
}

function classifyAudioState(integratedLufs: number): AudioState {
  if (integratedLufs < -20) {
    return 'low'
  }

  if (integratedLufs <= -16) {
    return 'adequate'
  }

  return 'high'
}

function getMarginLabel(truePeakDbtp: number): MarginLabel {
  const headroom = Math.abs(truePeakDbtp)

  if (headroom >= 6) {
    return 'Wide'
  }

  if (headroom >= 3) {
    return 'Medium'
  }

  return 'Low'
}

function getAudioStateLabel(audioState: AudioState) {
  if (audioState === 'low') {
    return 'Low Audio'
  }

  if (audioState === 'adequate') {
    return 'Adequate Audio'
  }

  return 'High Audio'
}

export type ProcessingPhase =
  | 'idle'
  | 'analyzing'
  | 'ready'
  | 'blocked'
  | 'previewing'
  | 'exporting'
  | 'error'

export type AudioState = 'low' | 'adequate' | 'high'
export type MarginLabel = 'Wide' | 'Medium' | 'Low'
export type PreviewMode = 'original' | 'adjusted'
export type PlaybackSupportStatus =
  | 'supported'
  | 'likely'
  | 'unknown'
  | 'unsupported'

export type ValidationCode =
  | 'unsupported-format'
  | 'file-too-large'
  | 'video-too-long'
  | 'missing-audio'
  | 'unsupported-video-codec'
  | 'analysis-failed'
  | 'preview-failed'
  | 'export-failed'

export interface ValidationIssue {
  code: ValidationCode
  message: string
  canRecover: boolean
}

export interface ProbeStream {
  index: number
  codec_type?: string
  codec_name?: string
  codec_tag_string?: string
  width?: number
  height?: number
  duration?: string
  avg_frame_rate?: string
  r_frame_rate?: string
  pix_fmt?: string
  sample_rate?: string
  channels?: number
  bit_rate?: string
}

export interface ProbeFormat {
  filename?: string
  format_name?: string
  duration?: string
  size?: string
}

export interface ProbeResult {
  streams: ProbeStream[]
  format: ProbeFormat
}

export interface MediaSummary {
  container: string
  durationSeconds: number
  sizeBytes: number
  hasAudio: boolean
  videoCodec: string | null
  videoCodecTag: string | null
  audioCodec: string | null
  audioCodecTag: string | null
  width: number | null
  height: number | null
  frameRate: number | null
  bitrate: number | null
  audioSampleRate: number | null
  audioChannels: number | null
  audioBitrate: number | null
}

export interface BrowserPlaybackSupport {
  status: PlaybackSupportStatus
  label: string
  detail: string
  mimeType: string
  canPlayType: CanPlayTypeResult
  mediaCapabilities?: {
    supported: boolean
    smooth: boolean
    powerEfficient: boolean
  }
}

export interface AudioAnalysis {
  integratedLufs: number
  truePeakDbtp: number
  loudnessRange: number
  threshold: number
}

export interface DerivedAnalysis {
  gainDb: number
  projectedTruePeakDbtp: number
  audioState: AudioState
  audioStateLabel: string
  marginLabel: MarginLabel
  recommendation: string
}

export interface GeneratedAsset {
  name: string
  sizeBytes: number
  url: string
  mediaSummary: MediaSummary | null
}

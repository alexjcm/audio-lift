export function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B'
  }

  const kilobytes = value / 1024
  const megabytes = value / 1024 ** 2

  if (megabytes >= 1) {
    return `${megabytes.toFixed(2)} MB`
  }

  if (kilobytes >= 1) {
    return `${kilobytes.toFixed(2)} KB`
  }

  return `${Math.round(value)} B`
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00'
  }

  const totalSeconds = Math.round(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function formatDb(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)} dB`
}

export function formatLufs(value: number) {
  return `${value.toFixed(1)} LUFS`
}

export function formatTruePeak(value: number) {
  return `${value.toFixed(1)} dBTP`
}

export function formatFrameRate(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return '---'
  }

  return `${Math.round(value)} fps`
}

export function formatSampleRate(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return '---'
  }

  return `${Math.round(value / 1000)} kHz`
}

export function formatChannels(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return '---'
  }

  if (value === 1) {
    return 'Mono'
  }

  if (value === 2) {
    return 'Stereo'
  }

  return `${value} ch`
}

export function formatAudioBitrate(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return '---'
  }

  return `${Math.round(value / 1000)} kbps`
}

export function formatFileNameMiddle(
  value: string,
  startLength = 14,
  endLength = 12,
) {
  if (!value) {
    return ''
  }

  const minimumVisibleLength = startLength + endLength + 1

  if (value.length <= minimumVisibleLength) {
    return value
  }

  return `${value.slice(0, startLength)}…${value.slice(-endLength)}`
}

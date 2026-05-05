import {
  formatAudioBitrate,
  formatBytes,
  formatChannels,
  formatDuration,
  formatFrameRate,
  formatLufs,
  formatSampleRate,
  formatTruePeak,
} from '../lib/formatters'
import { cn, getPillClass, panelClass } from '../lib/ui'
import { getFileExtension } from '../lib/validation'
import type { AudioAnalysis, DerivedAnalysis, MediaSummary } from '../types'

type MediaTechnicalPanelProps = {
  mediaSummary: MediaSummary | null
  selectedFile: File
  baseAnalysis: AudioAnalysis | null
  derivedAnalysis: DerivedAnalysis | null
}

export function MediaTechnicalPanel({
  mediaSummary,
  selectedFile,
  baseAnalysis,
  derivedAnalysis,
}: MediaTechnicalPanelProps) {
  const metadataItems = [
    { label: 'Size', value: formatBytes(selectedFile.size) },
    { label: 'Duration', value: mediaSummary ? formatDuration(mediaSummary.durationSeconds) : '...' },
    { label: 'Format', value: mediaSummary?.container.toUpperCase() ?? getFileExtension(selectedFile.name).toUpperCase() },
    { label: 'Video Codec', value: mediaSummary?.videoCodec?.toUpperCase() ?? '---' },
    { label: 'FPS', value: formatFrameRate(mediaSummary?.frameRate ?? null) },
    { label: 'Audio Codec', value: mediaSummary?.audioCodec?.toUpperCase() ?? '---' },
    { label: 'Sample Rate', value: formatSampleRate(mediaSummary?.audioSampleRate ?? null) },
    { label: 'Channels', value: formatChannels(mediaSummary?.audioChannels ?? null) },
    { label: 'Bitrate', value: formatAudioBitrate(mediaSummary?.audioBitrate ?? null) },
  ]

  const metrics = baseAnalysis && derivedAnalysis ? [
    { label: 'Integrated LUFS', value: formatLufs(baseAnalysis.integratedLufs) },
    { label: 'Measured Peak', value: formatTruePeak(baseAnalysis.truePeakDbtp) },
    { label: 'Dynamic Range', value: derivedAnalysis.marginLabel },
  ] : []

  return (
    <section className={cn(panelClass, 'px-3 py-2 max-[720px]:px-2.5 max-[720px]:py-1.5')}>
      <header className="mb-1.5 flex items-center justify-between gap-2 border-b border-ozone-border pb-1">
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="text-technical text-ozone-accent">Media Analysis</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {derivedAnalysis && (
            <span className={cn(getPillClass(derivedAnalysis.audioState), "shrink-0 px-1.5 py-0.5 text-[0.4rem]")}>
              {derivedAnalysis.audioStateLabel}
            </span>
          )}
        </div>
      </header>

      <div className="mb-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {metadataItems.map((item) => (
          <div key={item.label} className="flex min-w-0 items-baseline gap-1">
            <span className="shrink-0 text-[0.48rem] text-technical text-ozone-text-muted/95">{item.label}:</span>
            <span className="truncate text-[0.7rem] font-mono font-bold text-ozone-text">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {metrics.length > 0 ? (
          metrics.map((metric) => (
            <div key={metric.label} className="flex min-w-0 flex-col leading-tight">
              {metric.label === 'Dynamic Range' ? (
                <div className="flex min-w-0 items-baseline gap-1">
                  <span className="shrink-0 text-[0.46rem] text-technical uppercase tracking-wider text-ozone-text-muted/95">
                    {metric.label}:
                  </span>
                  <span className="truncate text-[0.82rem] font-mono font-bold text-ozone-text">
                    {metric.value}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-[0.46rem] text-technical uppercase tracking-wider text-ozone-text-muted/95">
                    {metric.label}
                  </span>
                  <span className="text-[0.82rem] font-mono font-bold text-ozone-text">
                    {metric.value}
                  </span>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="py-1 opacity-30">
            <span className="text-[0.6rem] text-technical">Waiting for signal processing...</span>
          </div>
        )}
      </div>
    </section>
  )
}

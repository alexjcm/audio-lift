import { useState } from 'react'
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
import { cn, compactPanelClass, getPillClass } from '../lib/ui'
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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
    <section className={cn(compactPanelClass, 'relative overflow-visible')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="shrink-0 text-technical text-ozone-accent">
              Media Analysis
            </h2>
            {derivedAnalysis ? (
              <span
                className={cn(
                  getPillClass(derivedAnalysis.audioState),
                  'shrink-0 px-1.5 py-0.5 text-[0.4rem]',
                )}
              >
                {derivedAnalysis.audioStateLabel}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={cn(
            'btn-technical inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[2px] border border-ozone-border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.06em] text-ozone-text-muted transition-all duration-200',
            'hover:border-ozone-accent/35 hover:text-ozone-accent',
            isDetailsOpen && 'border-ozone-accent/35 text-ozone-accent',
          )}
          aria-expanded={isDetailsOpen}
          aria-controls="media-analysis-details"
          onClick={() => setIsDetailsOpen((value) => !value)}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 10v5m0-8h.01" strokeLinecap="round" />
          </svg>
          Details
        </button>
      </div>

      {isDetailsOpen ? (
        <div
          id="media-analysis-details"
          className="mt-3 rounded-sm border border-ozone-border-bright bg-[#12141a]/98 p-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-[4px] animate-in fade-in slide-in-from-top-2 duration-200"
          role="region"
          aria-label="Media analysis details"
        >
          <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1">
            {metadataItems.map((item) => (
              <div key={item.label} className="flex min-w-0 items-baseline gap-1">
                <span className="shrink-0 text-[0.48rem] text-technical text-ozone-text-muted/95">
                  {item.label}:
                </span>
                <span className="truncate text-[0.7rem] font-mono font-bold text-ozone-text">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-ozone-border pt-3">
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
                <span className="text-[0.6rem] text-technical">
                  Waiting for signal processing...
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

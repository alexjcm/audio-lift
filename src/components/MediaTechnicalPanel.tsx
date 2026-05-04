import {
  formatAudioBitrate,
  formatBytes,
  formatChannels,
  formatDuration,
  formatFileNameMiddle,
  formatFrameRate,
  formatLufs,
  formatSampleRate,
  formatTruePeak,
} from '../lib/formatters'
import { cn, getPillClass, panelClass } from '../lib/ui'
import { getFileExtension } from '../lib/validation'
import type { AudioAnalysis, DerivedAnalysis, MediaSummary, ProcessingPhase } from '../types'

type MediaTechnicalPanelProps = {
  mediaSummary: MediaSummary | null
  selectedFile: File
  phase: ProcessingPhase
  baseAnalysis: AudioAnalysis | null
  derivedAnalysis: DerivedAnalysis | null
}

export function MediaTechnicalPanel({
  mediaSummary,
  selectedFile,
  phase,
  baseAnalysis,
  derivedAnalysis,
}: MediaTechnicalPanelProps) {
  const summaryItems = [
    { label: 'Size', value: formatBytes(selectedFile.size) },
    { label: 'Duration', value: mediaSummary ? formatDuration(mediaSummary.durationSeconds) : '...' },
    { label: 'Format', value: mediaSummary?.container.toUpperCase() ?? getFileExtension(selectedFile.name).toUpperCase() },
  ]
  const videoItems = [
    { label: 'Codec', value: mediaSummary?.videoCodec?.toUpperCase() ?? '---' },
    { label: 'FPS', value: formatFrameRate(mediaSummary?.frameRate ?? null) },
  ]
  const audioItems = [
    { label: 'Codec', value: mediaSummary?.audioCodec?.toUpperCase() ?? '---' },
    { label: 'Sample Rate', value: formatSampleRate(mediaSummary?.audioSampleRate ?? null) },
    { label: 'Channels', value: formatChannels(mediaSummary?.audioChannels ?? null) },
    { label: 'Bitrate', value: formatAudioBitrate(mediaSummary?.audioBitrate ?? null) },
  ]

  const metrics = baseAnalysis && derivedAnalysis ? [
    { label: 'Integrated LUFS', value: formatLufs(baseAnalysis.integratedLufs) },
    { label: 'Measured Peak', value: formatTruePeak(baseAnalysis.truePeakDbtp) },
    { label: 'Projected Peak', value: formatTruePeak(derivedAnalysis.projectedTruePeakDbtp) },
    { label: 'Dynamic Range', value: derivedAnalysis.marginLabel },
  ] : []

  return (
    <section className={cn(panelClass, 'px-4 py-3 max-[720px]:px-3 max-[720px]:py-2.5')}>
      {/* Header with Title and File Name */}
      <header className="mb-2.5 flex items-center justify-between gap-2.5 border-b border-ozone-border pb-1.5">
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="text-technical text-ozone-accent">Media Analysis</h2>
          {phase === 'analyzing' && (
            <span className="flex items-center gap-1 text-[0.6rem] font-mono text-ozone-accent animate-pulse">
              <span className="h-1 w-1 rounded-full bg-current"></span>
              ANALYZING
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 overflow-hidden">
          {derivedAnalysis && (
            <span className={cn(getPillClass(derivedAnalysis.audioState), "shrink-0 px-1.5 py-0.5 text-[0.45rem]")}>
              {derivedAnalysis.audioStateLabel}
            </span>
          )}
          <span className="truncate text-technical text-ozone-text-muted/95" title={selectedFile.name}>
            {formatFileNameMiddle(selectedFile.name)}
          </span>
        </div>
      </header>

      {/* Media Summary Section */}
      <div className="mb-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 md:flex md:flex-wrap md:gap-x-5 md:gap-y-1.5">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-baseline gap-1.5 min-w-0">
            <span className="shrink-0 text-[0.5rem] text-technical text-ozone-text-muted/95">{item.label}:</span>
            <span className="truncate text-[0.76rem] font-mono font-bold text-ozone-text">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <TechnicalGroup
          title="Video"
          items={videoItems}
        />
        <TechnicalGroup
          title="Audio"
          items={audioItems}
        />
      </div>

      {/* Subtle Separator */}
      <div className="mb-3 h-px w-full bg-ozone-border"></div>

      {/* Signal Analytics Section */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:flex md:flex-wrap md:gap-x-6 md:gap-y-2">
        {metrics.length > 0 ? (
          metrics.map((metric) => (
            <div key={metric.label} className="flex min-w-0 flex-col leading-tight md:min-w-[76px]">
              <span className="text-[0.46rem] text-technical uppercase tracking-wider text-ozone-text-muted/95">
                {metric.label}
              </span>
              <span className="text-[0.82rem] font-mono font-bold text-ozone-text">
                {metric.value}
              </span>
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

type TechnicalGroupProps = {
  title: string
  items: Array<{
    label: string
    value: string
  }>
}

function TechnicalGroup({ title, items }: TechnicalGroupProps) {
  return (
    <div className="rounded-sm border border-ozone-border bg-black/18 p-2">
      <div className="mb-1.5 text-[0.5rem] text-technical text-ozone-accent/90">
        {title}
      </div>
      <div className="grid gap-1">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="flex items-baseline gap-1.5 min-w-0">
            <span className="shrink-0 text-[0.48rem] text-technical text-ozone-text-muted/95">
              {item.label}:
            </span>
            <span className="truncate text-[0.74rem] font-mono font-bold text-ozone-text">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

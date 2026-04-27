import { formatBytes, formatDuration, formatFileNameMiddle, formatLufs, formatTruePeak } from '../lib/formatters'
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
    { label: 'Video', value: mediaSummary?.videoCodec?.toUpperCase() ?? '...' },
    { label: 'Audio', value: mediaSummary?.audioCodec?.toUpperCase() ?? '...' },
    { label: 'Format', value: mediaSummary?.container.toUpperCase() ?? getFileExtension(selectedFile.name).toUpperCase() },
  ]

  const metrics = baseAnalysis && derivedAnalysis ? [
    { label: 'Integrated LUFS', value: formatLufs(baseAnalysis.integratedLufs) },
    { label: 'Measured Peak', value: formatTruePeak(baseAnalysis.truePeakDbtp) },
    { label: 'Projected Peak', value: formatTruePeak(derivedAnalysis.projectedTruePeakDbtp) },
    { label: 'Dynamic Range', value: derivedAnalysis.marginLabel },
  ] : []

  return (
    <section className={panelClass}>
      {/* Header with Title and File Name */}
      <header className="mb-4 flex items-center justify-between border-b border-ozone-border pb-2 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="text-technical text-ozone-accent">Media Analysis</h2>
          {phase === 'analyzing' && (
            <span className="flex items-center gap-1 text-[0.6rem] font-mono text-ozone-accent animate-pulse">
              <span className="h-1 w-1 rounded-full bg-current"></span>
              ANALYZING
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 overflow-hidden">
          {derivedAnalysis && (
            <span className={cn(getPillClass(derivedAnalysis.audioState), "text-[0.45rem] py-0.5 px-1.5 shrink-0")}>
              {derivedAnalysis.audioStateLabel}
            </span>
          )}
          <span className="text-technical text-ozone-text-muted opacity-80 truncate" title={selectedFile.name}>
            {formatFileNameMiddle(selectedFile.name)}
          </span>
        </div>
      </header>

      {/* Media Summary Section */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-baseline gap-2">
            <span className="text-[0.5rem] text-technical text-ozone-text-muted">{item.label}:</span>
            <span className="text-[0.75rem] font-mono font-bold text-ozone-text">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Subtle Separator */}
      <div className="h-px w-full bg-ozone-border mb-4"></div>

      {/* Signal Analytics Section */}
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {metrics.length > 0 ? (
          metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col min-w-[80px]">
              <span className="text-[0.45rem] text-technical text-ozone-text-muted uppercase tracking-wider">
                {metric.label}
              </span>
              <span className="text-[0.85rem] font-mono font-bold text-ozone-text">
                {metric.value}
              </span>
            </div>
          ))
        ) : (
          <div className="py-2 opacity-30">
            <span className="text-[0.6rem] text-technical">Waiting for signal processing...</span>
          </div>
        )}
      </div>

    </section>
  )
}


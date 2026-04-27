import { cn, panelClass } from '../lib/ui'
import type { ProcessingPhase } from '../types'

type ActionsPanelProps = {
  onExport: () => Promise<void>
  onGeneratePreview: () => Promise<void>
  phase: ProcessingPhase
}

export function ActionsPanel({
  onExport,
  onGeneratePreview,
  phase,
}: ActionsPanelProps) {
  const isProcessing = phase === 'previewing' || phase === 'exporting'
  const isExporting = phase === 'exporting'
  const isPreviewing = phase === 'previewing'

  return (
    <section className={panelClass}>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={cn(
            "btn-ozone group flex items-center justify-center gap-2 py-2.5",
            isPreviewing && "animate-pulse border-ozone-accent/40 bg-ozone-accent/5"
          )}
          onClick={onGeneratePreview}
          disabled={isProcessing}
        >
          {isPreviewing ? (
            <>
              <LoadingSpinner />
              <span className="text-ozone-accent text-xs">Generating...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:text-ozone-accent" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.75 9L12 11.75 9.25 9M12 11.75V5m6 14H6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs">Build Preview</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={cn(
            "btn-ozone group flex items-center justify-center gap-2 py-2.5 border-ozone-accent/30 bg-ozone-accent/10 hover:bg-ozone-accent/20",
            isExporting && "animate-pulse"
          )}
          onClick={onExport}
          disabled={isProcessing}
        >
          {isExporting ? (
            <>
              <LoadingSpinner />
              <span className="text-ozone-accent text-xs">Exporting...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-ozone-accent glow-cyan" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
              </svg>
              <span className="text-ozone-accent font-bold text-xs">Export Master</span>
            </>
          )}
        </button>
      </div>
    </section>
  )
}

function LoadingSpinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-ozone-accent border-r-transparent glow-cyan"
      aria-hidden="true"
    ></span>
  )
}


import { cn, panelClass } from '../lib/ui'
import type { ProcessingPhase } from '../types'

type ActionsPanelProps = {
  onExport: () => Promise<void>
  phase: ProcessingPhase
}

export function ActionsPanel({
  onExport,
  phase,
}: ActionsPanelProps) {
  const isProcessing = phase === 'exporting'
  const isExporting = phase === 'exporting'

  return (
    <section className={cn(panelClass, 'px-3 py-2.5 max-[720px]:px-2.5 max-[720px]:py-2')}>
      <div className="grid grid-cols-1 gap-2.5">
        <button
          type="button"
          className={cn(
            "btn-ozone group flex min-h-[2.65rem] items-center justify-center gap-2 px-3 py-2 text-center",
            "border-ozone-accent/28 bg-ozone-accent/11 hover:bg-ozone-accent/18",
            isExporting && "animate-pulse"
          )}
          onClick={onExport}
          disabled={isProcessing}
        >
          {isExporting ? (
            <>
              <LoadingSpinner />
              <span className="text-xs text-ozone-accent">Exporting...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-ozone-accent glow-cyan" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
              </svg>
              <span className="text-[0.72rem] font-bold tracking-[0.04em] text-ozone-accent">Export Master</span>
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

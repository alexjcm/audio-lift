import { cn, panelClass } from '../lib/ui'
import { IconExport } from './Icons'
import type {
  EngineStatus,
  MobileRenderWarning,
  ProcessingPhase,
} from '../types'

type ActionsPanelProps = {
  engineStatus: EngineStatus
  engineStatusMessage: string | null
  mobileRenderWarning: MobileRenderWarning | null
  onExport: () => Promise<void>
  phase: ProcessingPhase
}

export function ActionsPanel({
  engineStatus,
  engineStatusMessage,
  mobileRenderWarning,
  onExport,
  phase,
}: ActionsPanelProps) {
  const isExporting = phase === 'exporting'

  return (
    <section className={cn(panelClass, 'px-3 py-2.5 max-[720px]:px-2.5 max-[720px]:py-2')}>
      <div className="grid grid-cols-1 gap-2.5">
        {engineStatusMessage ? (
          <div
            className={cn(
              'rounded-sm border px-3 py-2',
              engineStatus === 'failed'
                ? 'border-ozone-warning/20 bg-ozone-warning/8'
                : 'border-ozone-border-bright bg-black/35',
            )}
          >
            <span
              className={cn(
                'text-[0.62rem] font-mono uppercase tracking-[0.08em]',
                engineStatus === 'failed'
                  ? 'text-ozone-warning'
                  : 'text-ozone-text-muted',
              )}
            >
              {engineStatusMessage}
            </span>
          </div>
        ) : null}

        {mobileRenderWarning ? (
          <div
            className={cn(
              'rounded-sm border px-3 py-2',
              mobileRenderWarning.level === 'critical'
                ? 'border-ozone-warning/24 bg-ozone-warning/10'
                : 'border-ozone-accent/16 bg-ozone-accent/6',
            )}
          >
            <div
              className={cn(
                'text-[0.62rem] font-mono uppercase tracking-[0.08em]',
                mobileRenderWarning.level === 'critical'
                  ? 'text-ozone-warning'
                  : 'text-ozone-accent',
              )}
            >
              {mobileRenderWarning.title}
            </div>
            <p
              className={cn(
                'mt-1 text-[0.72rem] leading-snug',
                mobileRenderWarning.level === 'critical'
                  ? 'text-ozone-warning'
                  : 'text-ozone-text',
              )}
            >
              {mobileRenderWarning.detail}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          className={cn(
            "btn-ozone group flex min-h-[2.65rem] items-center justify-center gap-2 px-3 py-2 text-center",
            "border-ozone-accent/28 bg-ozone-accent/11 hover:bg-ozone-accent/18",
            isExporting && "animate-pulse"
          )}
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <LoadingSpinner />
              <span className="text-xs text-ozone-accent">Exporting...</span>
            </>
          ) : (
            <>
              <IconExport className="h-3.5 w-3.5 shrink-0 text-ozone-accent glow-cyan" />
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

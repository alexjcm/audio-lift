import type { RefObject } from 'react'
import { cn, panelClass } from '../lib/ui'
import type { GeneratedAsset, PreviewMode } from '../types'

type PreviewPanelProps = {
  activeVideoSrc: string | null
  comparisonLoopEnabled: boolean
  listeningModeLabel: string
  onLoadedMetadata: () => void
  onPreviewModeChange: (mode: PreviewMode) => void
  onReplayComparison: () => void
  onToggleComparisonLoop: () => void
  onTimeUpdate: () => void
  previewAsset: GeneratedAsset | null
  previewMode: PreviewMode
  videoRef: RefObject<HTMLVideoElement | null>
}

export function PreviewPanel({
  activeVideoSrc,
  comparisonLoopEnabled,
  listeningModeLabel,
  onLoadedMetadata,
  onPreviewModeChange,
  onReplayComparison,
  onToggleComparisonLoop,
  onTimeUpdate,
  previewAsset,
  previewMode,
  videoRef,
}: PreviewPanelProps) {
  return (
    <aside className="grid gap-6">
      <section
        className={cn(
          panelClass,
          'relative overflow-hidden pt-0 pb-0 max-[720px]:pt-0 max-[720px]:pb-0',
        )}
      >
        {/* Video / Visualizer Shell */}
        <div
          className={cn(
            'relative overflow-hidden rounded-sm border border-ozone-border-bright shadow-inner',
            activeVideoSrc
              ? 'mx-auto flex w-fit max-w-full justify-center bg-black grid-technical'
              : 'grid min-h-[180px] place-items-center bg-black grid-technical max-[720px]:min-h-[140px]',
          )}
        >
          {activeVideoSrc ? (
            <video
              key={activeVideoSrc}
              ref={videoRef}
              className="relative z-10 block h-auto w-auto max-h-[min(42svh,320px)] max-w-full rounded-[2px] bg-black object-contain max-[720px]:max-h-[min(30svh,220px)]"
              src={activeVideoSrc}
              controls
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              playsInline
              onLoadedMetadata={onLoadedMetadata}
              onTimeUpdate={onTimeUpdate}
            />
          ) : (
            <div className="grid min-h-[180px] w-full place-items-center p-6 text-center text-technical text-ozone-text-muted max-[720px]:min-h-[140px] opacity-40">
              <div className="flex flex-col items-center gap-4">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4" strokeLinecap="round"/>
                </svg>
                NO SIGNAL DETECTED
              </div>
            </div>
          )}
          
          {/* Decorative Corner Elements */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-ozone-accent/30 pointer-events-none"></div>
        </div>

        {previewAsset ? (
          <div className="mt-2 flex flex-col gap-2 rounded-sm border border-ozone-border bg-black/35 p-2 max-[720px]:p-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.58rem] text-technical text-ozone-text-muted">
                Listening to{' '}
                <span className="text-ozone-accent">{listeningModeLabel}</span>
              </span>
              <span
                className={cn(
                  'text-[0.55rem] text-technical transition-colors',
                  comparisonLoopEnabled
                    ? 'text-ozone-accent'
                    : 'text-ozone-text-muted/70',
                )}
              >
                {comparisonLoopEnabled ? 'Looping 4s' : 'Loop Off'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn-ozone flex items-center justify-center gap-2 py-2 text-[0.68rem] font-semibold tracking-[0.04em]"
                onClick={onReplayComparison}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4v6h6M20 20v-6h-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 9a7 7 0 0 0-12-3L4 10m0 5a7 7 0 0 0 12 3l4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Replay
              </button>

              <button
                type="button"
                className={cn(
                  'btn-ozone flex items-center justify-center gap-2 py-2 text-[0.68rem] font-semibold tracking-[0.04em]',
                  comparisonLoopEnabled &&
                    'border-ozone-accent/30 bg-ozone-accent/10 text-ozone-accent glow-cyan',
                )}
                onClick={onToggleComparisonLoop}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M17 1l4 4-4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 11V9a4 4 0 0 1 4-4h14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 23l-4-4 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 13v2a4 4 0 0 1-4 4H3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {comparisonLoopEnabled ? 'Loop On' : 'Loop 4s'}
              </button>
            </div>
          </div>
        ) : null}

        {/* Mode Selector */}
        <div className="mt-2">
          <div
            className="grid grid-cols-2 gap-1 p-1 bg-black/40 border border-ozone-border rounded-sm"
            role="tablist"
          >
            <button
              type="button"
              className={cn(
                "btn-technical flex items-center justify-center gap-2 py-2 px-4 text-[0.7rem] font-bold uppercase transition-all duration-200",
                previewMode === 'original' 
                  ? "bg-ozone-accent/10 text-ozone-accent border border-ozone-accent/30 glow-cyan" 
                  : "text-ozone-text-muted hover:text-ozone-text"
              )}
              onClick={() => onPreviewModeChange('original')}
            >
              <div className={cn("h-1 w-1 rounded-full bg-current", previewMode === 'original' && "animate-pulse")}></div>
              Original Signal
            </button>
            <button
              type="button"
              className={cn(
                "btn-technical flex items-center justify-center gap-2 py-2 px-4 text-[0.7rem] font-bold uppercase transition-all duration-200",
                previewMode === 'adjusted' 
                  ? "bg-ozone-accent/10 text-ozone-accent border border-ozone-accent/30 glow-cyan" 
                  : "text-ozone-text-muted hover:text-ozone-text",
                !previewAsset && "opacity-20 cursor-not-allowed"
              )}
              onClick={() => onPreviewModeChange('adjusted')}
              disabled={!previewAsset}
            >
              <div className={cn("h-1 w-1 rounded-full bg-current", previewMode === 'adjusted' && "animate-pulse")}></div>
              Processed Output
            </button>
          </div>
        </div>
      </section>
    </aside>
  )
}

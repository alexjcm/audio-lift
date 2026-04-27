import type { RefObject } from 'react'
import { cn, panelClass } from '../lib/ui'
import type { GeneratedAsset, PreviewMode } from '../types'

type PreviewPanelProps = {
  activeVideoSrc: string | null
  onLoadedMetadata: () => void
  onPreviewModeChange: (mode: PreviewMode) => void
  onTimeUpdate: () => void
  previewAsset: GeneratedAsset | null
  previewMode: PreviewMode
  videoRef: RefObject<HTMLVideoElement | null>
}

export function PreviewPanel({
  activeVideoSrc,
  onLoadedMetadata,
  onPreviewModeChange,
  onTimeUpdate,
  previewAsset,
  previewMode,
  videoRef,
}: PreviewPanelProps) {
  return (
    <aside className="grid gap-6">
      <section className={cn(panelClass, 'relative overflow-hidden')}>
        {/* Video / Visualizer Shell */}
        <div className="relative grid min-h-[220px] place-items-center overflow-hidden rounded-sm border border-ozone-border-bright bg-black grid-technical shadow-inner max-[720px]:min-h-[160px]">
          {activeVideoSrc ? (
            <video
              key={activeVideoSrc}
              ref={videoRef}
              className="block h-auto max-h-[min(42svh,320px)] w-full bg-black object-contain max-[720px]:max-h-[min(30svh,220px)] relative z-10"
              src={activeVideoSrc}
              controls
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              playsInline
              loop={previewMode === 'adjusted'}
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

        {/* Mode Selector */}
        <div className="mt-6">
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


function ToggleIcon() {
  return (
    <span
      className="flex h-[18px] w-[18px] items-center justify-between opacity-95"
      aria-hidden="true"
    >
      <span className="h-3 w-0.5 bg-current"></span>
      <span className="h-3 w-0.5 bg-current"></span>
      <span className="h-3 w-0.5 bg-current"></span>
      <span className="h-3 w-0.5 bg-current"></span>
    </span>
  )
}

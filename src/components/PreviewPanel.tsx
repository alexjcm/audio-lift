import type { ChangeEvent, RefObject } from 'react'
import { formatDuration, formatFileNameMiddle } from '../lib/formatters'
import { cn, panelClass } from '../lib/ui'
import type { PreviewMode } from '../types'

type PreviewPanelProps = {
  activeVideoSrc: string | null
  currentTime: number
  duration: number
  fileName?: string | null
  isPlaying: boolean
  onFileSelection: (file: File) => Promise<void>
  onEnded: () => void
  onLoadedMetadata: () => void
  onPause: () => void
  onPlay: () => void
  onPlayPause: () => Promise<void>
  onPreviewModeChange: (mode: PreviewMode) => void
  onSeekChange: (time: number) => void
  onTimeUpdate: () => void
  previewMode: PreviewMode
  videoRef: RefObject<HTMLVideoElement | null>
}

export function PreviewPanel({
  activeVideoSrc,
  currentTime,
  duration,
  fileName,
  isPlaying,
  onFileSelection,
  onEnded,
  onLoadedMetadata,
  onPause,
  onPlay,
  onPlayPause,
  onPreviewModeChange,
  onSeekChange,
  onTimeUpdate,
  previewMode,
  videoRef,
}: PreviewPanelProps) {
  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await onFileSelection(file)
    event.target.value = ''
  }

  const scrubberMax = duration > 0 ? duration : 0
  const scrubberValue =
    scrubberMax > 0 ? Math.min(currentTime, scrubberMax) : 0

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
            'relative overflow-hidden rounded-sm border border-ozone-border-bright shadow-inner max-[720px]:h-[220px]',
            activeVideoSrc
              ? 'mx-auto flex w-fit max-w-full justify-center bg-black grid-technical'
              : 'grid min-h-[180px] place-items-center bg-black grid-technical',
          )}
        >
          {activeVideoSrc ? (
            <div className="relative z-10">
              <video
                key={activeVideoSrc}
                ref={videoRef}
                className="block h-auto w-auto max-h-[min(42svh,320px)] max-w-full rounded-[2px] bg-black object-contain max-[720px]:max-h-[min(30svh,220px)]"
                src={activeVideoSrc}
                disablePictureInPicture
                disableRemotePlayback
                playsInline
                onEnded={onEnded}
                onLoadedMetadata={onLoadedMetadata}
                onPause={onPause}
                onPlay={onPlay}
                onTimeUpdate={onTimeUpdate}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
                <div className="pointer-events-auto flex w-full max-w-[min(92%,34rem)] items-center gap-2 rounded-full border border-white/12 bg-black/58 px-3 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.34)] backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => {
                      void onPlayPause()
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5.5 w-5.5"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-0.5 h-5.5 w-5.5"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <input
                      type="range"
                      min={0}
                      max={scrubberMax}
                      step="any"
                      value={scrubberValue}
                      onChange={(event) =>
                        onSeekChange(Number(event.target.value))
                      }
                      disabled={scrubberMax <= 0}
                      aria-label="Seek video"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/28 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>

                  <div className="shrink-0 text-right font-mono text-[0.58rem] text-white/84">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[180px] h-full w-full place-items-center p-6 text-center text-technical text-ozone-text-muted opacity-40">
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

        {activeVideoSrc ? (
          <div className="mt-2 rounded-sm border border-ozone-border bg-black/35 px-2 py-1.5 max-[720px]:px-1.5">
            <div className="flex items-center justify-between gap-3">
              <span
                className="truncate font-mono text-[0.58rem] text-ozone-text-muted"
                title={fileName ?? undefined}
              >
                <span className="text-ozone-accent/90">
                  {formatFileNameMiddle(fileName ?? '', 12, 10)}
                </span>
              </span>
              <label className="btn-technical inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[2px] border border-ozone-border px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.06em] text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent">
                <input
                  type="file"
                  accept=".mp4,.mov,video/mp4,video/quicktime"
                  onChange={handleFileInput}
                  className="pointer-events-none absolute opacity-0"
                />
                Import Media
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-sm border border-ozone-border bg-black/35 px-2 py-1.5 max-[720px]:px-1.5">
            <div className="flex items-center justify-end">
              <label className="btn-technical inline-flex cursor-pointer items-center justify-center rounded-[2px] border border-ozone-border px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.06em] text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent">
                <input
                  type="file"
                  accept=".mp4,.mov,video/mp4,video/quicktime"
                  onChange={handleFileInput}
                  className="pointer-events-none absolute opacity-0"
                />
                Import Media
              </label>
            </div>
          </div>
        )}

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
                !activeVideoSrc && "opacity-20 cursor-not-allowed"
              )}
              onClick={() => onPreviewModeChange('adjusted')}
              disabled={!activeVideoSrc}
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

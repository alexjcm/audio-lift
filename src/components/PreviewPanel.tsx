import {
  type ChangeEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { formatDuration, formatFileNameMiddle } from '../lib/formatters'
import { cn, panelClass } from '../lib/ui'
import type { PreviewMode } from '../types'

type PreviewPanelProps = {
  activeVideoSrc: string | null
  fileName?: string | null
  importWorkflowStatusMessage: string | null
  isPlaying: boolean
  onFileSelection: (file: File) => Promise<void>
  onEnded: () => void
  onLoadedMetadata: () => void
  onPause: () => void
  onPlay: () => void
  onPlayPause: () => Promise<void>
  onPreviewModeChange: (mode: PreviewMode) => void
  onSeekChange: (time: number) => void
  previewMode: PreviewMode
  videoRef: RefObject<HTMLVideoElement | null>
}

export function PreviewPanel({
  activeVideoSrc,
  fileName,
  importWorkflowStatusMessage,
  isPlaying,
  onFileSelection,
  onEnded,
  onLoadedMetadata,
  onPause,
  onPlay,
  onPlayPause,
  onPreviewModeChange,
  onSeekChange,
  previewMode,
  videoRef,
}: PreviewPanelProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [importInputKey, setImportInputKey] = useState(0)
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(
    null,
  )
  const [isImporting, setIsImporting] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!activeVideoSrc) {
      setCurrentTime(0)
      setDuration(0)
    }
  }, [activeVideoSrc])

  useEffect(() => {
    const input = importInputRef.current
    if (!input) {
      return
    }

    const handleCancel = () => {
      setIsImporting(false)
      setImportStatusMessage(
        'No video was returned by iPhone. Try Import Media again if the picker closed without loading anything.',
      )
      setImportInputKey((value) => value + 1)
    }

    input.addEventListener('cancel', handleCancel)

    return () => {
      input.removeEventListener('cancel', handleCancel)
    }
  }, [importInputKey])

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''

    if (!file) {
      setIsImporting(false)
      setImportStatusMessage(
        'No compatible video was returned by iPhone. Try Import Media again.',
      )
      setImportInputKey((value) => value + 1)
      return
    }

    setIsImporting(true)
    setImportStatusMessage('Loading selected video...')

    try {
      await onFileSelection(file)
      setImportStatusMessage(null)
    } finally {
      setIsImporting(false)
      setImportInputKey((value) => value + 1)
    }
  }

  const handleImportInputClick = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.value = ''
    setImportStatusMessage('Waiting for video selection...')
  }

  const handleLoadedMetadata = () => {
    const element = videoRef.current
    if (element) {
      setCurrentTime(element.currentTime)
      setDuration(Number.isFinite(element.duration) ? element.duration : 0)
    }

    onLoadedMetadata()
  }

  const handleTimeUpdate = () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    setCurrentTime(element.currentTime)
  }

  const handleSeekInput = (nextTime: number) => {
    setCurrentTime(nextTime)
    onSeekChange(nextTime)
  }

  const handleVideoEnded = () => {
    const element = videoRef.current
    setCurrentTime(element ? element.duration : duration)
    onEnded()
  }

  const scrubberMax = duration > 0 ? duration : 0
  const scrubberValue =
    scrubberMax > 0 ? Math.min(currentTime, scrubberMax) : 0
  const visibleImportStatusMessage =
    importWorkflowStatusMessage ?? importStatusMessage

  const importControl = (
    <div className="flex items-center justify-end gap-3">
      {visibleImportStatusMessage ? (
        <p className="max-w-[14rem] text-right text-[0.58rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/82">
          {visibleImportStatusMessage}
        </p>
      ) : null}

      <div className="relative shrink-0">
        <div className="btn-technical inline-flex min-h-11 items-center justify-center rounded-[2px] border border-ozone-border px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent">
          {isImporting ? 'Loading Video...' : 'Import Media'}
        </div>
        <input
          key={importInputKey}
          ref={importInputRef}
          type="file"
          accept="video/*,.mp4,.mov"
          aria-label="Import media"
          disabled={isImporting}
          onClick={handleImportInputClick}
          onChange={(event) => {
            void handleFileInput(event)
          }}
          className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )

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
            'relative grid min-h-[220px] place-items-center overflow-hidden rounded-sm border border-ozone-border-bright bg-black shadow-inner grid-technical max-[720px]:h-[220px]',
            activeVideoSrc
              ? 'px-3 py-3'
              : 'min-h-[180px]',
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
                onEnded={handleVideoEnded}
                onLoadedMetadata={handleLoadedMetadata}
                onPause={onPause}
                onPlay={onPlay}
                onTimeUpdate={handleTimeUpdate}
              />
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

          {activeVideoSrc ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-5">
              <div className="pointer-events-auto flex w-full max-w-[32rem] items-center gap-3 rounded-full border border-white/12 bg-black/58 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.34)] backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    void onPlayPause()
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-5 w-5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex flex-1 items-center">
                  <input
                    type="range"
                    min={0}
                    max={scrubberMax}
                    step="any"
                    value={scrubberValue}
                    onChange={(event) =>
                      handleSeekInput(Number(event.target.value))
                    }
                    disabled={scrubberMax <= 0}
                    aria-label="Seek video"
                    className="block h-3 w-full cursor-pointer appearance-none rounded-full bg-white/28 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>

                <div className="shrink-0 text-right font-mono text-[0.54rem] text-white/84">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Decorative Corner Elements */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-ozone-accent/30 pointer-events-none"></div>
        </div>

        {activeVideoSrc ? (
          <>
            <div className="mt-2 rounded-sm border border-ozone-border bg-black/35 px-2 py-1.5 max-[720px]:px-1.5">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="truncate font-mono text-[0.66rem] text-ozone-text-muted"
                  title={fileName ?? undefined}
                >
                  <span className="text-ozone-accent/90">
                    {formatFileNameMiddle(fileName ?? '', 12, 10)}
                  </span>
                </span>

                {importControl}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-2 rounded-sm border border-ozone-border bg-black/35 px-2 py-1.5 max-[720px]:px-1.5">
            <div className="flex items-center justify-end">
              {importControl}
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
                "btn-technical flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-[0.7rem] font-bold uppercase transition-all duration-200",
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
                "btn-technical flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-[0.7rem] font-bold uppercase transition-all duration-200",
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

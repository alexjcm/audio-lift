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
import { IconNoSignal, IconPause, IconPlay } from './Icons'

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
  const scrubberRef = useRef<HTMLInputElement | null>(null)
  const timeDisplayRef = useRef<HTMLSpanElement | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const [importInputKey, setImportInputKey] = useState(0)
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(
    null,
  )
  const [isImporting, setIsImporting] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!activeVideoSrc) {
      setDuration(0)
      if (scrubberRef.current) scrubberRef.current.value = '0'
      if (timeDisplayRef.current) timeDisplayRef.current.textContent = ''
    }
  }, [activeVideoSrc])

  // RAF loop: updates scrubber + time display at 60fps without React re-renders
  useEffect(() => {
    if (!isPlaying) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      return
    }

    const tick = () => {
      const video = videoRef.current
      const scrubber = scrubberRef.current
      if (video && scrubber && Number.isFinite(video.duration) && video.duration > 0) {
        scrubber.value = String(video.currentTime)
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = `${formatDuration(video.currentTime)} / ${formatDuration(video.duration)}`
        }
      }
      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [isPlaying, videoRef])

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
    setImportStatusMessage('Waiting for iPhone to return the selected video...')
  }

  const handleLoadedMetadata = () => {
    const element = videoRef.current
    if (element) {
      const d = Number.isFinite(element.duration) ? element.duration : 0
      setDuration(d)
      if (scrubberRef.current) {
        scrubberRef.current.max = String(d)
        scrubberRef.current.value = '0'
      }
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = `${formatDuration(0)} / ${formatDuration(d)}`
      }
    }
    onLoadedMetadata()
  }

  const handleSeekInput = (nextTime: number) => {
    if (scrubberRef.current) scrubberRef.current.value = String(nextTime)
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = `${formatDuration(nextTime)} / ${formatDuration(duration)}`
    }
    onSeekChange(nextTime)
  }

  const handleVideoEnded = () => {
    const element = videoRef.current
    const endTime = element ? element.duration : duration
    if (scrubberRef.current) scrubberRef.current.value = String(endTime)
    onEnded()

    if (previewMode === 'adjusted' && element) {
      element.currentTime = 0
      if (scrubberRef.current) scrubberRef.current.value = '0'
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = `${formatDuration(0)} / ${formatDuration(duration)}`
      }
      void onPlayPause()
    }
  }

  const scrubberMax = duration > 0 ? duration : 0
  const visibleImportStatusMessage =
    importWorkflowStatusMessage ?? importStatusMessage

  const importControl = (
    <div className="flex items-center justify-end gap-2 max-[720px]:gap-1.5">
      {visibleImportStatusMessage ? (
        <p className="max-w-[13rem] text-right text-[0.54rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/82 max-[720px]:max-w-[8.5rem] max-[720px]:text-[0.48rem]">
          {visibleImportStatusMessage}
        </p>
      ) : null}

      <div className="relative shrink-0">
        <div className="btn-technical min-h-10 px-2.5 py-1.5 text-[0.58rem] tracking-[0.06em] max-[720px]:min-h-8 max-[720px]:px-2 max-[720px]:py-1 max-[720px]:text-[0.54rem] md:min-h-11 md:px-3 md:py-2 md:text-[0.62rem]">
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
    <aside className="grid gap-2.5 md:gap-6">
      <section
        className={cn(
          panelClass,
          'relative overflow-hidden pt-0 pb-0',
        )}
      >
        {/* Video / Visualizer Shell */}
        <div
          className={cn(
            'relative grid min-h-[220px] place-items-center overflow-hidden rounded-sm border border-ozone-border-bright bg-black shadow-inner grid-technical max-[720px]:min-h-[184px] max-[720px]:h-[196px]',
            activeVideoSrc
              ? 'px-3 py-3 max-[720px]:px-1.5 max-[720px]:py-1'
              : 'min-h-[180px] max-[720px]:min-h-[160px]',
          )}
        >
          {activeVideoSrc ? (
            <div className="relative z-10">
              <video
                key={activeVideoSrc}
                ref={videoRef}
                className="block h-auto w-auto max-h-[min(42svh,320px)] max-w-full rounded-[2px] bg-black object-contain max-[720px]:max-h-[min(24svh,184px)]"
                src={activeVideoSrc}
                disablePictureInPicture
                disableRemotePlayback
                playsInline
                onEnded={handleVideoEnded}
                onLoadedMetadata={handleLoadedMetadata}
                onPause={onPause}
                onPlay={onPlay}
              />
            </div>
          ) : (
            <div className="grid min-h-[180px] h-full w-full place-items-center p-6 text-center text-technical text-ozone-text-muted opacity-40">
              <div className="flex flex-col items-center gap-4">
                <IconNoSignal className="w-12 h-12 text-ozone-text-muted" />
                NO SIGNAL DETECTED
              </div>
            </div>
          )}

          {activeVideoSrc ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-20 flex justify-center px-3 max-[720px]:bottom-1 max-[720px]:px-1.5">
              <div className="pointer-events-auto flex w-full max-w-[32rem] items-center gap-2 rounded-full border border-white/12 bg-black/58 px-2.5 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.34)] backdrop-blur-md max-[720px]:gap-0.5 max-[720px]:px-0.5 max-[720px]:py-0 md:gap-3 md:px-3 md:py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    void onPlayPause()
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 max-[720px]:h-[42px] max-[720px]:w-[42px] md:h-11 md:w-11"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <IconPause className="h-5 w-5 max-[720px]:h-[21px] max-[720px]:w-[21px]" aria-hidden="true" />
                  ) : (
                    <IconPlay className="ml-0.5 h-5 w-5 max-[720px]:h-[21px] max-[720px]:w-[21px]" aria-hidden="true" />
                  )}
                </button>

                <div className="min-w-0 flex flex-1 items-center">
                  <input
                    ref={scrubberRef}
                    type="range"
                    min={0}
                    max={scrubberMax}
                    step="any"
                    defaultValue={0}
                    onChange={(event) =>
                      handleSeekInput(Number(event.target.value))
                    }
                    disabled={scrubberMax <= 0}
                    aria-label="Seek video"
                    className="block h-2.5 w-full cursor-pointer appearance-none rounded-full bg-white/28 accent-white disabled:cursor-not-allowed disabled:opacity-40 max-[720px]:h-2 md:h-3"
                  />
                </div>

                <span
                  ref={timeDisplayRef}
                  className="hidden shrink-0 text-right font-mono text-[0.54rem] text-white/84 md:block"
                />
              </div>
            </div>
          ) : null}
          
          {/* Decorative Corner Elements */}
          <div className="absolute top-1 left-1 h-2 w-2 border-t border-l border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute top-1 right-1 h-2 w-2 border-t border-r border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute bottom-1 left-1 h-2 w-2 border-b border-l border-ozone-accent/30 pointer-events-none"></div>
          <div className="absolute right-1 bottom-1 h-2 w-2 border-b border-r border-ozone-accent/30 pointer-events-none"></div>
        </div>

        {activeVideoSrc ? (
          <>
            <div className="mt-0 rounded-sm border border-ozone-border bg-black/35 px-2 py-1.5 max-[720px]:px-1.5 max-[720px]:py-0.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="truncate font-mono text-[0.62rem] text-ozone-text-muted max-[720px]:text-[0.52rem]"
                  title={fileName ?? undefined}
                >
                  <span className="text-ozone-accent/90">
                    {formatFileNameMiddle(fileName ?? '', 7, 6)}
                  </span>
                </span>

                {importControl}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-0 rounded-sm border border-ozone-border bg-black/35 px-2 py-1.5 max-[720px]:px-1.5 max-[720px]:py-0.5">
            <div className="flex items-center justify-end">
              {importControl}
            </div>
          </div>
        )}

        {/* Bypass Toggle */}
        <div className="mt-1 max-[720px]:mt-0.5">
          <button
            type="button"
            disabled={!activeVideoSrc}
            className={cn(
              'btn-technical flex w-full min-h-10 gap-2 rounded-sm px-3 py-1.5 text-[0.62rem] tracking-[0.08em] md:min-h-11 md:gap-2.5 md:py-2 md:text-[0.7rem]',
              previewMode === 'original'
                ? 'border-ozone-accent/40 bg-ozone-accent/10 text-ozone-accent glow-cyan'
                : 'border-ozone-border bg-black/40 text-ozone-text-muted hover:border-ozone-accent/25 hover:text-ozone-text',
              !activeVideoSrc && 'cursor-not-allowed opacity-30',
            )}
            aria-pressed={previewMode === 'original'}
            aria-label={previewMode === 'original' ? 'Bypass active — listening to original signal' : 'Bypass inactive — listening to processed output'}
            onClick={() =>
              onPreviewModeChange(
                previewMode === 'original' ? 'adjusted' : 'original',
              )
            }
          >
            {/* LED indicator */}
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-all duration-300',
                previewMode === 'original'
                  ? 'bg-ozone-accent shadow-[0_0_6px_rgba(0,240,255,0.9)] animate-pulse'
                  : 'bg-ozone-text-muted/40',
              )}
              aria-hidden="true"
            />
            Bypass
            {/* State label */}
            <span
              className={cn(
                'ml-1 text-[0.5rem] tracking-[0.1em] transition-all duration-200',
                previewMode === 'original'
                  ? 'text-ozone-accent/75'
                  : 'text-ozone-text-muted/50',
              )}
            >
              {previewMode === 'original' ? 'ON · ORIGINAL' : 'OFF · PROCESSED'}
            </span>
          </button>
        </div>
      </section>
    </aside>
  )
}

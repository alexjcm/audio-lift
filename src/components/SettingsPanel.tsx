import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BASS_EQ_FREQ_MAX_HZ,
  BASS_EQ_FREQ_MIN_HZ,
  VIRTUAL_BASS_CUTOFF_MAX_HZ,
  VIRTUAL_BASS_CUTOFF_MIN_HZ,
} from '../lib/constants'
import { formatHz } from '../lib/formatters'
import { cn, panelClass } from '../lib/ui'

type SettingsPanelProps = {
  bassEqHighHz: number
  bassEqLowHz: number
  onBassEqHighChange: (value: number) => void
  onBassEqLowChange: (value: number) => void
  onReset: () => void
  onVirtualBassCutoffChange: (value: number) => void
  virtualBassCutoffHz: number
}

export function SettingsPanel({
  bassEqHighHz,
  bassEqLowHz,
  onBassEqHighChange,
  onBassEqLowChange,
  onReset,
  onVirtualBassCutoffChange,
  virtualBassCutoffHz,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="flex items-start justify-end">
      <button
        type="button"
        className={cn(
          'btn-technical hidden min-h-11 self-start items-center justify-center gap-2 rounded-[2px] border border-ozone-border px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-ozone-text-muted transition-all duration-200 md:inline-flex',
          'bg-black/35 hover:border-ozone-accent/35 hover:text-ozone-accent',
          isOpen && 'border-ozone-accent/35 text-ozone-accent glow-cyan',
        )}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m15.36-6.36-2.83 2.83M8.47 15.53l-2.83 2.83m0-12.72 2.83 2.83m9.89 9.89-2.83-2.83" />
        </svg>
        Settings
        </button>

      <button
        type="button"
        className={cn(
          'btn-technical fixed right-4 z-[80] inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_16px_36px_-16px_rgba(0,0,0,0.82)] backdrop-blur md:hidden',
          'border-ozone-accent/35 bg-[#0f151f]/96 text-ozone-accent hover:border-ozone-accent/60 hover:bg-ozone-accent/12 hover:text-ozone-accent',
          isOpen && 'border-ozone-accent/60 bg-ozone-accent/12 text-ozone-accent glow-cyan',
        )}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open settings"
        title="Settings"
        onClick={() => setIsOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m15.36-6.36-2.83 2.83M8.47 15.53l-2.83 2.83m0-12.72 2.83 2.83m9.89 9.89-2.83-2.83" />
        </svg>
      </button>

      {isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-end md:items-stretch md:justify-end"
              role="presentation"
            >
              <button
                type="button"
                aria-label="Close settings"
                className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[1px]"
                onClick={() => setIsOpen(false)}
              />

              <div
                className={cn(
                  panelClass,
                  'relative w-full max-h-[82vh] overflow-y-auto rounded-b-none border-x-0 border-b-0 border-ozone-border-bright bg-[#0d1118]/98 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] shadow-[0_-14px_32px_-18px_rgba(0,0,0,0.85)] md:h-full md:max-h-none md:w-[min(24rem,100vw)] lg:w-[25rem] md:rounded-none md:border-y-0 md:border-r-0 md:px-5 md:py-4 md:shadow-[-18px_0_40px_-24px_rgba(0,0,0,0.88)]',
                )}
                role="dialog"
                aria-label="Global settings"
              >
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-ozone-border pb-3">
                  <div>
                    <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ozone-accent">
                      Global Settings
                    </h2>
                    <p className="mt-1 text-[0.54rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/75">
                      Low-end processing
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-technical min-h-11 rounded-[2px] border border-ozone-border px-3 py-2 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent"
                      onClick={onReset}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn-technical inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-ozone-border text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent"
                      aria-label="Close settings"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid gap-3.5">
                  <div className="rounded-sm border border-ozone-border-bright bg-black/35 p-3 md:p-3.5">
                    <div className="mb-2.5 flex items-start justify-between gap-3">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
                        Bass EQ Band
                      </p>

                      <span className="shrink-0 rounded-[2px] border border-ozone-accent/15 bg-ozone-accent/8 px-2 py-1 text-[0.72rem] font-mono font-bold text-ozone-accent">
                        {formatHz(bassEqLowHz)} - {formatHz(bassEqHighHz)}
                      </span>
                    </div>

                    <BandRangeSlider
                      lowValue={bassEqLowHz}
                      highValue={bassEqHighHz}
                      min={BASS_EQ_FREQ_MIN_HZ}
                      max={BASS_EQ_FREQ_MAX_HZ}
                      onLowChange={onBassEqLowChange}
                      onHighChange={onBassEqHighChange}
                    />
                  </div>

                  <div className="rounded-sm border border-ozone-border-bright bg-black/35 p-3 md:p-3.5">
                    <SettingRow
                      label="Virtual Bass Cutoff"
                      description="Input band cutoff"
                      value={virtualBassCutoffHz}
                      min={VIRTUAL_BASS_CUTOFF_MIN_HZ}
                      max={VIRTUAL_BASS_CUTOFF_MAX_HZ}
                      onChange={onVirtualBassCutoffChange}
                      flush
                    />
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="h-[calc(env(safe-area-inset-bottom,0px)+3rem)] md:hidden"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

type BandRangeSliderProps = {
  lowValue: number
  highValue: number
  min: number
  max: number
  onLowChange: (value: number) => void
  onHighChange: (value: number) => void
}

function BandRangeSlider({
  lowValue,
  highValue,
  min,
  max,
  onLowChange,
  onHighChange,
}: BandRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [activeHandle, setActiveHandle] = useState<'low' | 'high' | null>(null)
  const valueSpan = Math.max(1, max - min)
  const lowPercent = ((lowValue - min) / valueSpan) * 100
  const highPercent = ((highValue - min) / valueSpan) * 100

  useEffect(() => {
    if (!activeHandle) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const nextValue = getValueFromPointer(event.clientX, trackRef.current, min, max)
      if (nextValue === null) {
        return
      }

      if (activeHandle === 'low') {
        onLowChange(Math.min(nextValue, highValue - 1))
        return
      }

      onHighChange(Math.max(nextValue, lowValue + 1))
    }

    const stopDragging = () => {
      setActiveHandle(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  }, [activeHandle, highValue, lowValue, max, min, onHighChange, onLowChange])

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const nextValue = getValueFromPointer(event.clientX, trackRef.current, min, max)
    if (nextValue === null) {
      return
    }

    const targetHandle =
      Math.abs(nextValue - lowValue) <= Math.abs(nextValue - highValue) ? 'low' : 'high'
    setActiveHandle(targetHandle)

    if (targetHandle === 'low') {
      onLowChange(Math.min(nextValue, highValue - 1))
      return
    }

    onHighChange(Math.max(nextValue, lowValue + 1))
  }

  return (
    <div className="rounded-sm border border-ozone-border bg-black/30 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            Bass EQ Range
          </p>
          <p className="mt-1 text-[0.52rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/70">
            Drag low and high handles
          </p>
        </div>

        <span className="text-[0.78rem] font-mono font-bold text-ozone-accent">
          {formatHz(lowValue)} - {formatHz(highValue)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[0.5rem] font-mono text-ozone-text-muted/70">
          {formatHz(min)}
        </span>

        <div
          ref={trackRef}
          className="relative h-10 flex-1 touch-none"
          onPointerDown={handleTrackPointerDown}
        >
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/15" />
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ozone-accent/65"
            style={{
              left: `${lowPercent}%`,
              right: `${100 - highPercent}%`,
            }}
          />

          <button
            type="button"
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-ozone-accent bg-[#f5ffff] shadow-[0_0_14px_rgba(0,240,255,0.45)]"
            style={{ left: `calc(${lowPercent}% - 0.625rem)` }}
            aria-label="Adjust Bass EQ low range"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setActiveHandle('low')
            }}
          />

          <button
            type="button"
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-ozone-accent bg-[#f5ffff] shadow-[0_0_14px_rgba(0,240,255,0.45)]"
            style={{ left: `calc(${highPercent}% - 0.625rem)` }}
            aria-label="Adjust Bass EQ high range"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setActiveHandle('high')
            }}
          />
        </div>

        <span className="shrink-0 text-[0.5rem] font-mono text-ozone-text-muted/70">
          {formatHz(max)}
        </span>
      </div>
    </div>
  )
}

type SettingRowProps = {
  description: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  value: number
  flush?: boolean
}

function SettingRow({
  description,
  label,
  max,
  min,
  onChange,
  value,
  flush = false,
}: SettingRowProps) {
  return (
    <div className={cn(!flush && 'rounded-sm border border-ozone-border bg-black/30 px-3 py-2.5')}>
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            {label}
          </p>
          <p className="mt-1 text-[0.52rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/70">
            {description}
          </p>
        </div>

        <span className="text-[0.78rem] font-mono font-bold text-ozone-accent">
          {formatHz(value)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="block h-3 w-full cursor-pointer appearance-none rounded-full bg-white/18 accent-[var(--ozone-accent)]"
      />

      <div className="mt-1.5 flex items-center justify-between text-[0.5rem] font-mono text-ozone-text-muted/70">
        <span>Min {formatHz(min)}</span>
        <span>Max {formatHz(max)}</span>
      </div>
    </div>
  )
}

function getValueFromPointer(
  clientX: number,
  trackElement: HTMLDivElement | null,
  min: number,
  max: number,
) {
  if (!trackElement) {
    return null
  }

  const bounds = trackElement.getBoundingClientRect()
  const pointerRatio = (clientX - bounds.left) / bounds.width
  const clampedRatio = Math.min(1, Math.max(0, pointerRatio))
  return Math.round(min + clampedRatio * (max - min))
}

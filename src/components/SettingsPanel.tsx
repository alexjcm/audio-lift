import { type PointerEvent as ReactPointerEvent, useRef, useState, useEffect } from 'react'
import {
  BASS_EQ_FREQ_MAX_HZ,
  BASS_EQ_FREQ_MIN_HZ,
  VIRTUAL_BASS_CUTOFF_MAX_HZ,
  VIRTUAL_BASS_CUTOFF_MIN_HZ,
  VIRTUAL_BASS_DRIVE_MAX,
  VIRTUAL_BASS_DRIVE_MIN,
  TARGET_TRUE_PEAK_DEFAULT,
  TARGET_TRUE_PEAK_MAX,
} from '../lib/constants'
import { formatHz } from '../lib/formatters'
import { useRafSliderValue } from '../hooks/useRafSliderValue'
import { getValueFromPointer } from '../hooks/useSliderPointer'
import { cn, panelClass } from '../lib/ui'
import { PremiumSlider } from './PremiumSlider'
import { BottomSheet } from './BottomSheet'
import { IconSettings, IconClose } from './Icons'

type SettingsPanelProps = {
  bassEqHighHz: number
  bassEqLowHz: number
  onBassEqHighChange: (value: number) => void
  onBassEqLowChange: (value: number) => void
  onReset: () => void
  onVirtualBassCutoffChange: (value: number) => void
  onVirtualBassDriveChange: (value: number) => void
  onTargetTruePeakChange: (value: number) => void
  showMobileFloatingButton?: boolean
  virtualBassCutoffHz: number
  virtualBassDrive: number
  targetTruePeakDbtp: number
}

export type SettingsContentProps = {
  bassEqHighHz: number
  bassEqLowHz: number
  onBassEqHighChange: (value: number) => void
  onBassEqLowChange: (value: number) => void
  onVirtualBassCutoffChange: (value: number) => void
  onVirtualBassDriveChange: (value: number) => void
  onTargetTruePeakChange: (value: number) => void
  virtualBassCutoffHz: number
  virtualBassDrive: number
  targetTruePeakDbtp: number
}

export function SettingsPanel({
  bassEqHighHz,
  bassEqLowHz,
  onBassEqHighChange,
  onBassEqLowChange,
  onReset,
  onVirtualBassCutoffChange,
  onVirtualBassDriveChange,
  onTargetTruePeakChange,
  showMobileFloatingButton = true,
  virtualBassCutoffHz,
  virtualBassDrive,
  targetTruePeakDbtp,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-start justify-end">
      <button
        type="button"
        className={cn(
          'btn-technical hidden min-h-11 self-start gap-2 px-3 py-2 text-[0.62rem] tracking-[0.08em] md:inline-flex',
          'bg-black/35 hover:border-ozone-accent/35 hover:text-ozone-accent',
          isOpen && 'border-ozone-accent/35 text-ozone-accent glow-cyan',
        )}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((value) => !value)}
      >
        <IconSettings className="h-3.5 w-3.5" aria-hidden="true" />
        Settings
        </button>

      {showMobileFloatingButton ? (
        <button
          type="button"
          className={cn(
            'btn-technical fixed right-4 z-[80] h-12 w-12 rounded-full shadow-[0_16px_36px_-16px_rgba(0,0,0,0.82)] backdrop-blur md:hidden',
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
          <IconSettings className="h-4.5 w-4.5" aria-hidden="true" />
        </button>
      ) : null}

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        closeLabel="Close settings"
        containerClassName="fixed inset-0 z-[90] flex items-end md:items-stretch md:justify-end"
        backdropClassName="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[1px]"
      >              <div
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
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-technical min-h-11 px-3 py-2 text-[0.55rem] tracking-[0.08em]"
                      onClick={onReset}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn-technical h-11 w-11"
                      aria-label="Close settings"
                      onClick={() => setIsOpen(false)}
                    >
                      <IconClose className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <SettingsContent
                  bassEqHighHz={bassEqHighHz}
                  bassEqLowHz={bassEqLowHz}
                  onBassEqHighChange={onBassEqHighChange}
                  onBassEqLowChange={onBassEqLowChange}
                  onVirtualBassCutoffChange={onVirtualBassCutoffChange}
                  onVirtualBassDriveChange={onVirtualBassDriveChange}
                  onTargetTruePeakChange={onTargetTruePeakChange}
                  virtualBassCutoffHz={virtualBassCutoffHz}
                  virtualBassDrive={virtualBassDrive}
                  targetTruePeakDbtp={targetTruePeakDbtp}
                />

                <div
                  aria-hidden="true"
                  className="h-[calc(env(safe-area-inset-bottom,0px)+3rem)] md:hidden"
                />
              </div>
      </BottomSheet>
    </div>
  )
}

export function SettingsContent({
  bassEqHighHz,
  bassEqLowHz,
  onBassEqHighChange,
  onBassEqLowChange,
  onVirtualBassCutoffChange,
  onVirtualBassDriveChange,
  onTargetTruePeakChange,
  virtualBassCutoffHz,
  virtualBassDrive,
  targetTruePeakDbtp,
}: SettingsContentProps) {
  return (
    <div className="grid gap-2.5">
      <div className="rounded-sm border border-ozone-border-bright bg-black/35 p-2.5 md:p-3">
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            Output Ceiling
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[TARGET_TRUE_PEAK_DEFAULT, TARGET_TRUE_PEAK_MAX].map((value) => {
            const isActive = targetTruePeakDbtp === value
            return (
              <button
                key={value}
                type="button"
                className={cn(
                  'btn-technical flex min-h-12 px-3 py-2 text-[0.68rem] tracking-[0.06em]',
                  isActive
                    ? 'border-ozone-accent/40 bg-ozone-accent/12 text-ozone-accent glow-cyan shadow-[inset_0_0_12px_rgba(0,240,255,0.08)]'
                    : 'border-ozone-border bg-black/20 text-ozone-text-muted hover:border-ozone-accent/30 hover:text-ozone-text',
                )}
                onClick={() => onTargetTruePeakChange(value)}
              >
                {value.toFixed(1)} dBTP
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[0.52rem] leading-relaxed text-ozone-text-muted/60">
          -1.0 is the standard for streaming platforms. -0.1 maximizes output level.
        </p>
      </div>

      <div className="rounded-sm border border-ozone-border-bright bg-black/35 p-2.5 md:p-3">
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            Bass EQ Band
          </p>
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

      <div className="rounded-sm border border-ozone-border-bright bg-black/35 p-2.5 md:p-3">
        <div className="grid gap-2.5">
          <SettingRow
            label="Virtual Bass Cutoff"
            value={virtualBassCutoffHz}
            min={VIRTUAL_BASS_CUTOFF_MIN_HZ}
            max={VIRTUAL_BASS_CUTOFF_MAX_HZ}
            onChange={onVirtualBassCutoffChange}
            flush
          />

          <div className="h-px bg-ozone-border-bright/50" />

          <SettingRow
            label="Virtual Bass Drive"
            value={virtualBassDrive}
            min={VIRTUAL_BASS_DRIVE_MIN}
            max={VIRTUAL_BASS_DRIVE_MAX}
            onChange={onVirtualBassDriveChange}
            flush
            isInteger
          />
        </div>
      </div>
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
  const lowHandleRef = useRef<HTMLButtonElement | null>(null)
  const highHandleRef = useRef<HTMLButtonElement | null>(null)
  const activeHandleRef = useRef<'low' | 'high' | null>(null)
  const [activeHandle, setActiveHandle] = useState<'low' | 'high' | null>(null)
  const valueSpan = Math.max(1, max - min)
  const {
    displayValue: displayedLowValue,
    endInteraction: endLowInteraction,
    scheduleValue: scheduleLowValue,
    startInteraction: startLowInteraction,
  } = useRafSliderValue({
    value: lowValue,
    onChange: onLowChange,
  })
  const {
    displayValue: displayedHighValue,
    endInteraction: endHighInteraction,
    scheduleValue: scheduleHighValue,
    startInteraction: startHighInteraction,
  } = useRafSliderValue({
    value: highValue,
    onChange: onHighChange,
  })
  const displayedLowValueRef = useRef(displayedLowValue)
  const displayedHighValueRef = useRef(displayedHighValue)
  const lowPercent = ((displayedLowValue - min) / valueSpan) * 100
  const highPercent = ((displayedHighValue - min) / valueSpan) * 100

  displayedLowValueRef.current = displayedLowValue
  displayedHighValueRef.current = displayedHighValue

  useEffect(() => {
    if (!activeHandle) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const nextValue = getValueFromPointer(event.clientX, trackRef.current, min, max)
      if (nextValue === null) {
        return
      }

      if (activeHandleRef.current === 'low') {
        scheduleLowValue(
          Math.min(nextValue, displayedHighValueRef.current - 1),
        )
        return
      }

      scheduleHighValue(
        Math.max(nextValue, displayedLowValueRef.current + 1),
      )
    }

    const stopDragging = () => {
      endLowInteraction()
      endHighInteraction()
      activeHandleRef.current = null
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
  }, [activeHandle, endHighInteraction, endLowInteraction, max, min, scheduleHighValue, scheduleLowValue])

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const nextValue = getValueFromPointer(event.clientX, trackRef.current, min, max)
    if (nextValue === null) {
      return
    }

    const targetHandle =
      Math.abs(nextValue - displayedLowValueRef.current) <=
      Math.abs(nextValue - displayedHighValueRef.current)
        ? 'low'
        : 'high'
    activeHandleRef.current = targetHandle
    setActiveHandle(targetHandle)

    if (targetHandle === 'low') {
      startLowInteraction()
      scheduleLowValue(Math.min(nextValue, displayedHighValueRef.current - 1))
      return
    }

    startHighInteraction()
    scheduleHighValue(Math.max(nextValue, displayedLowValueRef.current + 1))
  }

  return (
    <div className="rounded-sm border border-ozone-border bg-black/30 px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            Bass EQ Range
          </p>
        </div>

        <span className="text-[0.78rem] font-mono font-bold text-ozone-accent">
          {formatHz(displayedLowValue)} - {formatHz(displayedHighValue)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[0.65rem] font-mono text-ozone-text-muted/80">
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
            ref={lowHandleRef}
            className={cn(
              'absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border border-ozone-accent bg-[#f5ffff] shadow-[0_0_14px_rgba(0,240,255,0.45)] touch-none',
              activeHandle === 'low' && 'shadow-[0_0_18px_rgba(0,240,255,0.62)]',
            )}
            style={{ left: `calc(${lowPercent}% - 0.625rem)` }}
            aria-label="Adjust Bass EQ low range"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              activeHandleRef.current = 'low'
              setActiveHandle('low')
              lowHandleRef.current?.setPointerCapture(event.pointerId)
              startLowInteraction()
            }}
            onPointerUp={() => {
              endLowInteraction()
              activeHandleRef.current = null
              setActiveHandle(null)
            }}
            onPointerCancel={() => {
              endLowInteraction()
              activeHandleRef.current = null
              setActiveHandle(null)
            }}
          />

          <button
            type="button"
            ref={highHandleRef}
            className={cn(
              'absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border border-ozone-accent bg-[#f5ffff] shadow-[0_0_14px_rgba(0,240,255,0.45)] touch-none',
              activeHandle === 'high' && 'shadow-[0_0_18px_rgba(0,240,255,0.62)]',
            )}
            style={{ left: `calc(${highPercent}% - 0.625rem)` }}
            aria-label="Adjust Bass EQ high range"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              activeHandleRef.current = 'high'
              setActiveHandle('high')
              highHandleRef.current?.setPointerCapture(event.pointerId)
              startHighInteraction()
            }}
            onPointerUp={() => {
              endHighInteraction()
              activeHandleRef.current = null
              setActiveHandle(null)
            }}
            onPointerCancel={() => {
              endHighInteraction()
              activeHandleRef.current = null
              setActiveHandle(null)
            }}
          />
        </div>

        <span className="shrink-0 text-[0.65rem] font-mono text-ozone-text-muted/80">
          {formatHz(max)}
        </span>
      </div>
    </div>
  )
}

type SettingRowProps = {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  value: number
  flush?: boolean
  isInteger?: boolean
}

function SettingRow({
  label,
  value,
  min,
  max,
  onChange,
  flush = false,
  isInteger = false,
}: SettingRowProps) {
  const slider = useRafSliderValue({
    value,
    onChange,
  })

  return (
    <div className={cn(!flush && 'rounded-sm border border-ozone-border bg-black/30 px-3 py-2')}>
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            {label}
          </p>
        </div>

        <span className="text-[0.78rem] font-mono font-bold text-ozone-accent">
          {isInteger ? slider.displayValue : formatHz(slider.displayValue)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[0.65rem] font-mono text-ozone-text-muted/80">
          {isInteger ? min : formatHz(min)}
        </span>

        <PremiumSlider
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          ariaLabel={label}
        />

        <span className="shrink-0 text-[0.65rem] font-mono text-ozone-text-muted/80">
          {isInteger ? max : formatHz(max)}
        </span>
      </div>
    </div>
  )
}



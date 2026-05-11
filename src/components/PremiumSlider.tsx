import { useRef } from 'react'
import { useRafSliderValue } from '../hooks/useRafSliderValue'
import { useSliderPointer } from '../hooks/useSliderPointer'
import { cn } from '../lib/ui'

type PremiumSliderProps = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  isHighlighted?: boolean
  className?: string
  ariaLabel?: string
}

export function PremiumSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  isHighlighted = false,
  className,
  ariaLabel,
}: PremiumSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const valueSpan = Math.max(1, max - min)
  
  const slider = useRafSliderValue({
    value,
    onChange,
  })

  const { isActive, handlePointerDown } = useSliderPointer({
    trackRef,
    min,
    max,
    step,
    disabled,
    onStartInteraction: slider.startInteraction,
    onEndInteraction: slider.endInteraction,
    onScheduleValue: slider.scheduleValue,
  })

  const percent = ((slider.displayValue - min) / valueSpan) * 100

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-10 flex-1 touch-none cursor-pointer select-none",
        disabled && "opacity-35 cursor-not-allowed",
        className
      )}
      onPointerDown={handlePointerDown}
    >
      {/* Background Track */}
      <div className="absolute left-3.5 right-3.5 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/15" />
      
      {/* Active Track */}
      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ozone-accent/65"
        style={{
          left: '0.875rem',
          width: `calc(${percent} * (100% - 1.75rem) / 100)`,
        }}
      />

      {/* Thumb */}
      <button
        type="button"
        className={cn(
          'absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border transition-all duration-200',
          isHighlighted 
            ? 'border-white/40 bg-ozone-accent shadow-[0_0_16px_rgba(0,240,255,0.75)]' 
            : 'border-ozone-accent bg-[#f5ffff] shadow-[0_0_14px_rgba(0,240,255,0.45)]',
          isActive && 'scale-110 shadow-[0_0_20px_rgba(0,240,255,0.8)]',
          disabled && "cursor-not-allowed border-ozone-border bg-gray-500 shadow-none"
        )}
        style={{ left: `calc(${percent} * (100% - 1.75rem) / 100)` }}
        aria-label={ariaLabel}
        disabled={disabled}
      />
    </div>
  )
}

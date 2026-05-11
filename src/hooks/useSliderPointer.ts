import { useState, useEffect, type PointerEvent as ReactPointerEvent } from 'react'

type UseSliderPointerProps = {
  trackRef: React.RefObject<HTMLElement | null>
  min: number
  max: number
  step?: number
  disabled?: boolean
  padding?: number
  onStartInteraction: () => void
  onEndInteraction: () => void
  onScheduleValue: (value: number) => void
}

export function useSliderPointer({
  trackRef,
  min,
  max,
  step = 1,
  disabled = false,
  padding = 14, // default 14px for px-3.5
  onStartInteraction,
  onEndInteraction,
  onScheduleValue,
}: UseSliderPointerProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const handlePointerMove = (event: PointerEvent) => {
      if (!trackRef.current) return
      const bounds = trackRef.current.getBoundingClientRect()
      const availableWidth = bounds.width - padding * 2
      const x = event.clientX - bounds.left - padding
      const ratio = x / availableWidth
      const clampedRatio = Math.min(1, Math.max(0, ratio))
      const rawValue = min + clampedRatio * (max - min)
      
      const steppedValue = Math.round(rawValue / step) * step
      onScheduleValue(Math.min(max, Math.max(min, steppedValue)))
    }

    const stopDragging = () => {
      onEndInteraction()
      setIsActive(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  }, [isActive, min, max, step, padding, onEndInteraction, onScheduleValue, trackRef])

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (disabled || !trackRef.current) return
    
    const bounds = trackRef.current.getBoundingClientRect()
    const availableWidth = bounds.width - padding * 2
    const x = event.clientX - bounds.left - padding
    const ratio = x / availableWidth
    const clampedRatio = Math.min(1, Math.max(0, ratio))
    const rawValue = min + clampedRatio * (max - min)
    
    const steppedValue = Math.round(rawValue / step) * step
    const finalValue = Math.min(max, Math.max(min, steppedValue))
    
    onStartInteraction()
    onScheduleValue(finalValue)
    setIsActive(true)
  }

  return {
    isActive,
    handlePointerDown,
  }
}

export function getValueFromPointer(
  clientX: number,
  trackElement: HTMLElement | null,
  min: number,
  max: number,
  padding: number = 0
) {
  if (!trackElement) {
    return null
  }

  const bounds = trackElement.getBoundingClientRect()
  const availableWidth = bounds.width - padding * 2
  const x = clientX - bounds.left - padding
  const pointerRatio = x / availableWidth
  const clampedRatio = Math.min(1, Math.max(0, pointerRatio))
  return Math.round(min + clampedRatio * (max - min))
}

import { useCallback, useEffect, useRef, useState } from 'react'

type UseRafSliderValueOptions = {
  value: number
  onChange: (value: number) => void
}

export function useRafSliderValue({
  value,
  onChange,
}: UseRafSliderValueOptions) {
  const frameRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)
  const latestValueRef = useRef(value)
  const committedValueRef = useRef(value)
  const interactingRef = useRef(false)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const flushValue = useCallback(() => {
    const nextValue = latestValueRef.current
    if (nextValue === committedValueRef.current) {
      return
    }

    committedValueRef.current = nextValue
    onChangeRef.current(nextValue)
  }, [])

  const cancelScheduledFrame = useCallback(() => {
    if (frameRef.current === null) {
      return
    }

    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = null
  }, [])

  const scheduleValue = useCallback(
    (nextValue: number) => {
      latestValueRef.current = nextValue
      setDisplayValue(nextValue)

      if (frameRef.current !== null) {
        return
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        flushValue()
      })
    },
    [flushValue],
  )

  const startInteraction = useCallback(() => {
    interactingRef.current = true
  }, [])

  const endInteraction = useCallback(() => {
    if (!interactingRef.current) {
      return
    }

    interactingRef.current = false
    cancelScheduledFrame()
    flushValue()
  }, [cancelScheduledFrame, flushValue])

  useEffect(() => {
    committedValueRef.current = value
    latestValueRef.current = value

    if (!interactingRef.current) {
      setDisplayValue(value)
    }
  }, [value])


  useEffect(() => {
    return () => {
      cancelScheduledFrame()
    }
  }, [cancelScheduledFrame])

  return {
    displayValue,
    endInteraction,
    scheduleValue,
    startInteraction,
  }
}

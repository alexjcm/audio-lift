import { useEffect, useRef, useState } from 'react'
import {
  GAIN_MAX_DB,
  GAIN_MIN_DB,
  GAIN_STEP_DB,
} from '../lib/constants'
import { formatTruePeak } from '../lib/formatters'
import { cn, compactPanelClass, getPillClass } from '../lib/ui'
import type { DerivedAnalysis } from '../types'

type GainControlPanelProps = {
  canAdjustVolume: boolean
  derivedAnalysis: DerivedAnalysis | null
  feedbackMessages: string[]
  gainDb: number
  onGainChange: (value: number) => void
}

export function GainControlPanel({
  canAdjustVolume,
  derivedAnalysis,
  feedbackMessages,
  gainDb,
  onGainChange,
}: GainControlPanelProps) {
  const [isWarningsOpen, setIsWarningsOpen] = useState(false)
  const warningsRef = useRef<HTMLDivElement | null>(null)
  const hasWarnings = canAdjustVolume && feedbackMessages.length > 0
  const exportStatusLabel = derivedAnalysis
    ? derivedAnalysis.exceedsTruePeakHeadroom
      ? 'True Peak Over Target'
      : derivedAnalysis.limiterLikelyRequired
        ? 'Limiter Likely'
        : derivedAnalysis.processingActive
          ? 'Headroom OK'
        : 'Headroom OK'
    : '---'

  useEffect(() => {
    if (!hasWarnings) {
      setIsWarningsOpen(false)
    }
  }, [hasWarnings])

  useEffect(() => {
    if (!isWarningsOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!warningsRef.current?.contains(event.target as Node)) {
        setIsWarningsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWarningsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isWarningsOpen])

  return (
    <section className={cn(compactPanelClass, 'relative overflow-visible max-[720px]:p-2.5')}>
      <div className="grid grid-cols-[minmax(0,1fr)_4.25rem] items-start gap-2.5 md:grid-cols-[minmax(0,1fr)_5rem] md:gap-4">
        <div ref={warningsRef} className="relative grid gap-2.5">
          <header className="relative mb-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-technical text-ozone-accent">Gain Control</h2>
              <div className="flex items-center gap-1.5">
                {hasWarnings ? (
                  <div className="relative">
                    <button
                      type="button"
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-sm border border-ozone-warning/25 bg-ozone-warning/8 text-ozone-warning transition-all md:h-11 md:w-11',
                        'hover:border-ozone-warning/45 hover:bg-ozone-warning/12',
                        isWarningsOpen && 'border-ozone-warning/45 bg-ozone-warning/12',
                      )}
                      aria-expanded={isWarningsOpen}
                      aria-haspopup="dialog"
                      aria-label={`Show ${feedbackMessages.length} warning${feedbackMessages.length === 1 ? '' : 's'}`}
                      onClick={() => setIsWarningsOpen((value) => !value)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 4l8 14H4L12 4z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M12 9v4m0 3h.01" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : null}

                <span className={cn(getPillClass('neutral'), 'inline-flex min-h-8 items-center px-1.5 py-0 text-[0.48rem] md:px-2 md:py-1 md:text-[0.58rem]')}>
                  Margin: {derivedAnalysis?.marginLabel ?? '---'}
                </span>
              </div>
            </div>
          </header>

          {isWarningsOpen ? (
            <div
              className="absolute left-0 right-0 top-8 z-30 rounded-sm border border-ozone-warning/20 bg-[#171117]/98 p-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-[2px]"
              role="dialog"
              aria-label="Signal warnings"
            >
              <div className="mb-2 flex items-center justify-between gap-3 border-b border-ozone-warning/12 pb-2">
                <strong className="text-[0.62rem] text-technical text-ozone-warning">
                  Signal Analysis
                </strong>
                <span className="text-[0.6rem] font-mono text-ozone-warning/75">
                  {feedbackMessages.length}
                </span>
              </div>
              <ul className="grid gap-2">
                {feedbackMessages.map((message) => (
                  <li
                    key={message}
                    className="flex items-start gap-2 text-[0.68rem] leading-snug text-ozone-warning"
                  >
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-ozone-warning"></span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Digital Display */}
          <div className="ozone-panel border-ozone-border-bright bg-black/40 p-3 max-[720px]:p-2.5">
            <div className="flex flex-col">
              <span className="mb-0.5 text-[0.54rem] text-technical text-ozone-text-muted">Gain to Apply</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[2rem] font-mono font-bold text-ozone-accent glow-cyan max-[720px]:text-[1.8rem]">
                  {gainDb > 0 ? '+' : ''}{gainDb.toFixed(1)}
                </span>
                <span className="text-[0.82rem] font-mono text-ozone-text-muted max-[720px]:text-[0.76rem]">dB</span>
              </div>
            </div>
            
            {derivedAnalysis && (
              <div className="mt-3 flex justify-between border-t border-ozone-border border-dashed pt-2.5">
                <div className="flex flex-col">
                  <span className="text-[0.5rem] text-technical text-ozone-text-muted">Proj. Peak</span>
                  <span className="text-[0.86rem] font-mono text-ozone-text md:text-sm">
                    {formatTruePeak(derivedAnalysis.projectedTruePeakDbtp)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[0.5rem] text-technical text-ozone-text-muted">Headroom</span>
                  <span className={cn(
                    derivedAnalysis.exceedsTruePeakHeadroom
                      ? "text-[0.66rem] font-mono md:text-sm"
                      : "text-[0.82rem] font-mono md:text-sm",
                    derivedAnalysis.exceedsTruePeakHeadroom
                      ? "text-ozone-warning"
                      : "text-ozone-safe"
                  )}>
                    {exportStatusLabel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Fader */}
        <div className="flex h-[182px] flex-col items-center gap-1 self-start pt-0.5 md:h-[208px]">
          <div className="relative flex h-full items-center">
            {/* Scale markings */}
            <div className="absolute -left-6.5 flex h-full flex-col justify-between py-1 text-[0.52rem] font-mono text-ozone-text-muted/90 md:-left-7 md:text-[0.62rem]">
              <span>+12</span>
              <span>+9</span>
              <span>+6</span>
              <span>+3</span>
              <span>0</span>
            </div>
            
            {/* The Track */}
            <div className="h-full w-2.5 rounded-full border border-ozone-border-bright bg-black overflow-hidden shadow-[0_0_18px_rgba(0,240,255,0.04)] md:w-2">
               <div 
                 className="w-full bg-ozone-accent glow-cyan transition-all duration-100" 
                 style={{ 
                   height: `${((gainDb - GAIN_MIN_DB) / (GAIN_MAX_DB - GAIN_MIN_DB)) * 100}%`,
                   marginTop: 'auto'
                 }}
               ></div>
            </div>

            {/* The Invisible Range Input for Control */}
            <input
              type="range"
              className="absolute -left-7 h-[182px] w-16 cursor-row-resize touch-none opacity-0 md:-left-5 md:h-[208px] md:w-12"
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
              } as any}
              min={GAIN_MIN_DB}
              max={GAIN_MAX_DB}
              step={GAIN_STEP_DB}
              value={gainDb}
              disabled={!canAdjustVolume}
              onChange={(event) => onGainChange(Number(event.target.value))}
            />
            
            {/* Custom Thumb Visual */}
            <div 
              className="pointer-events-none absolute -left-[1.15rem] h-5 w-10 rounded-sm border border-ozone-accent bg-white shadow-lg glow-cyan md:-left-4 md:h-4 md:w-9"
              style={{ 
                bottom: `calc(${((gainDb - GAIN_MIN_DB) / (GAIN_MAX_DB - GAIN_MIN_DB)) * 100}% - 8px)` 
              }}
            >
              <div className="mt-[8px] h-[1px] w-full bg-ozone-accent md:mt-[6px]"></div>
            </div>
          </div>
          <span className="mt-1.5 text-[0.5rem] text-technical tracking-[0.08em] text-ozone-text-muted/90 md:mt-2 md:text-[0.58rem]">Fader</span>
        </div>
      </div>

      {!canAdjustVolume && (
        <div className="mt-4 p-2 bg-ozone-accent/5 border border-ozone-accent/10 rounded-sm">
          <p className="text-[0.65rem] text-technical text-ozone-accent text-center animate-pulse">
            Waiting for audio analysis...
          </p>
        </div>
      )}
    </section>
  )
}

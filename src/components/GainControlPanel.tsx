import {
  GAIN_MAX_DB,
  GAIN_MIN_DB,
  GAIN_STEP_DB,
} from '../lib/constants'
import { formatTruePeak } from '../lib/formatters'
import { cn, compactPanelClass, getPillClass } from '../lib/ui'
import type { DerivedAnalysis } from '../types'

export function GainControlPanel({
  canAdjustVolume,
  derivedAnalysis,
  feedbackMessages,
  gainDb,
  onGainChange,
}: GainControlPanelProps) {
  return (
    <section className={compactPanelClass}>
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-technical text-ozone-accent">Gain Control</h2>
          <span className={getPillClass('neutral')}>
            Margin: {derivedAnalysis?.marginLabel ?? '---'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_auto] gap-6 items-center">
        <div className="grid gap-4">
          {/* Digital Display */}
          <div className="ozone-panel bg-black/40 p-4 border-ozone-border-bright">
            <div className="flex flex-col">
              <span className="text-[0.6rem] text-technical text-ozone-text-muted mb-1">Target Gain</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-ozone-accent glow-cyan">
                  {gainDb > 0 ? '+' : ''}{gainDb.toFixed(1)}
                </span>
                <span className="text-sm font-mono text-ozone-text-muted">dB</span>
              </div>
            </div>
            
            {derivedAnalysis && (
              <div className="mt-4 pt-4 border-t border-ozone-border border-dashed flex justify-between">
                <div className="flex flex-col">
                  <span className="text-[0.55rem] text-technical text-ozone-text-muted">Proj. Peak</span>
                  <span className="text-sm font-mono text-ozone-text">
                    {formatTruePeak(derivedAnalysis.projectedTruePeakDbtp)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[0.55rem] text-technical text-ozone-text-muted">Status</span>
                  <span className={cn(
                    "text-sm font-mono",
                    derivedAnalysis.projectedTruePeakDbtp > -1 ? "text-ozone-warning" : "text-ozone-safe"
                  )}>
                    {derivedAnalysis.projectedTruePeakDbtp > -1 ? 'Clipping' : 'Safe'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {canAdjustVolume && feedbackMessages.length > 0 && (
            <div className="ozone-panel p-3 bg-ozone-warning/5 border-ozone-warning/20">
              <ul className="grid gap-1">
                {feedbackMessages.map((message) => (
                  <li
                    key={message}
                    className="text-[0.7rem] leading-tight text-ozone-warning flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-ozone-warning"></span>
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Vertical Fader */}
        <div className="flex flex-col items-center h-[200px] gap-2">
          <div className="relative h-full flex items-center">
            {/* Scale markings */}
            <div className="absolute -left-6 h-full flex flex-col justify-between text-[0.6rem] font-mono text-ozone-text-muted py-1">
              <span>+12</span>
              <span>+6</span>
              <span>0</span>
              <span>-6</span>
              <span>-12</span>
            </div>
            
            {/* The Track */}
            <div className="w-1.5 h-full bg-black rounded-full border border-ozone-border-bright overflow-hidden">
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
              className="absolute h-[200px] w-8 -left-4 opacity-0 cursor-pointer"
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
              className="absolute w-6 h-3 bg-white border border-ozone-accent rounded-sm shadow-lg pointer-events-none -left-2.5 glow-cyan"
              style={{ 
                bottom: `calc(${((gainDb - GAIN_MIN_DB) / (GAIN_MAX_DB - GAIN_MIN_DB)) * 100}% - 6px)` 
              }}
            >
              <div className="w-full h-[1px] bg-ozone-accent mt-[5px]"></div>
            </div>
          </div>
          <span className="text-[0.6rem] text-technical text-ozone-text-muted mt-2">Fader</span>
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


import {
  BASS_EQ_MAX_DB,
  BASS_EQ_MIN_DB,
  BASS_EQ_STEP_DB,
  VIRTUAL_BASS_MAX_DB,
  VIRTUAL_BASS_MIN_DB,
  VIRTUAL_BASS_STEP_DB,
} from '../lib/constants'
import { formatDb } from '../lib/formatters'
import { cn, compactPanelClass } from '../lib/ui'

type BassControlPanelProps = {
  bassEqDb: number
  canAdjust: boolean
  onBassEqChange: (value: number) => void
  onVirtualBassChange: (value: number) => void
  virtualBassDb: number
}

export function BassControlPanel({
  bassEqDb,
  canAdjust,
  onBassEqChange,
  onVirtualBassChange,
  virtualBassDb,
}: BassControlPanelProps) {
  return (
    <section className={compactPanelClass}>
      <div className="mb-2 flex items-center justify-between gap-3 md:mb-3">
        <div>
          <h2 className="text-technical text-ozone-accent">Low-End Processing</h2>
        </div>
      </div>

      <div className="grid gap-2.5 md:gap-3">
        <ControlRow
          canAdjust={canAdjust}
          label="Bass EQ · Low-End EQ"
          showActiveIndicator
          isActive={bassEqDb > 0}
          value={bassEqDb}
          onChange={onBassEqChange}
          onReset={() => onBassEqChange(0)}
          min={BASS_EQ_MIN_DB}
          max={BASS_EQ_MAX_DB}
          step={BASS_EQ_STEP_DB}
        />

        <ControlRow
          canAdjust={canAdjust}
          label="Virtual Bass · Bass Enhancement"
          showActiveIndicator
          isActive={virtualBassDb > 0}
          value={virtualBassDb}
          onChange={onVirtualBassChange}
          onReset={() => onVirtualBassChange(0)}
          min={VIRTUAL_BASS_MIN_DB}
          max={VIRTUAL_BASS_MAX_DB}
          step={VIRTUAL_BASS_STEP_DB}
        />
      </div>

      {!canAdjust ? (
        <div className="mt-4 rounded-sm border border-ozone-accent/10 bg-ozone-accent/5 p-2">
          <p className="text-center text-[0.65rem] text-technical text-ozone-accent animate-pulse">
            Waiting for audio analysis...
          </p>
        </div>
      ) : null}
    </section>
  )
}

type ControlRowProps = {
  canAdjust: boolean
  isActive?: boolean
  label: string
  value: number
  onChange: (value: number) => void
  onReset: () => void
  showActiveIndicator?: boolean
  min: number
  max: number
  step: number
}

function ControlRow({
  canAdjust,
  isActive = false,
  label,
  value,
  onChange,
  onReset,
  showActiveIndicator = false,
  min,
  max,
  step,
}: ControlRowProps) {
  return (
    <div className="rounded-sm border border-ozone-border bg-black/35 p-2.5 md:p-3">
      <div className="mb-2 flex items-start justify-between gap-2 md:mb-3 md:gap-3">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.05em] text-ozone-text md:text-[0.68rem] md:tracking-[0.06em]">
              {label}
            </p>
            {showActiveIndicator ? (
              <span
                className={cn(
                  'mt-[1px] h-1.5 w-1.5 shrink-0 rounded-full border transition-all duration-200 md:h-2 md:w-2',
                  isActive
                    ? 'border-ozone-accent bg-ozone-accent shadow-[0_0_10px_rgba(0,240,255,0.75)]'
                    : 'border-ozone-border-bright bg-transparent',
                )}
                aria-hidden="true"
              />
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="min-w-[4.4rem] text-right text-[0.76rem] font-mono font-bold text-ozone-accent md:min-w-[5.25rem] md:text-[0.82rem]">
            {formatDb(value)}
          </span>
          <button
            type="button"
            className={cn(
              'btn-technical min-h-10 rounded-[2px] border border-ozone-border px-2.5 py-1.5 text-[0.48rem] font-bold uppercase tracking-[0.08em] text-ozone-text-muted transition-all duration-200 md:min-h-11 md:px-3 md:py-2 md:text-[0.55rem]',
              'hover:border-ozone-accent/35 hover:text-ozone-accent',
              !canAdjust && 'cursor-not-allowed opacity-30',
            )}
            disabled={!canAdjust}
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={!canAdjust}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="block h-2.5 w-full cursor-pointer appearance-none rounded-full bg-white/18 accent-[var(--ozone-accent)] disabled:cursor-not-allowed disabled:opacity-35 md:h-3"
      />

      <div className="mt-1.5 flex items-center justify-between text-[0.48rem] font-mono text-ozone-text-muted/85 md:mt-2 md:text-[0.55rem]">
        <span>{formatDb(min)}</span>
        <span>{formatDb(max)}</span>
      </div>
    </div>
  )
}

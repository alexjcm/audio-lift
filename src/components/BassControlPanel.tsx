import {
  BASS_EQ_MAX_DB,
  BASS_EQ_MIN_DB,
  BASS_EQ_STEP_DB,
  VIRTUAL_BASS_MAX_DB,
  VIRTUAL_BASS_MIN_DB,
  VIRTUAL_BASS_STEP_DB,
} from '../lib/constants'
import { formatDb, formatHz } from '../lib/formatters'
import { cn, compactPanelClass } from '../lib/ui'

type BassControlPanelProps = {
  bassEqDb: number
  bassEqHighHz: number
  bassEqLowHz: number
  canAdjust: boolean
  onBassEqChange: (value: number) => void
  onVirtualBassChange: (value: number) => void
  virtualBassDb: number
}

export function BassControlPanel({
  bassEqDb,
  bassEqHighHz,
  bassEqLowHz,
  canAdjust,
  onBassEqChange,
  onVirtualBassChange,
  virtualBassDb,
}: BassControlPanelProps) {
  return (
    <section className={compactPanelClass}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-technical text-ozone-accent">Low-End Processing</h2>
          <p className="mt-1 text-[0.62rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted">
            Bass body and psychoacoustic enhancement
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <ControlRow
          canAdjust={canAdjust}
          label="Bass EQ · Bass Body"
          secondaryLabel={`${formatHz(bassEqLowHz)} - ${formatHz(bassEqHighHz)}`}
          value={bassEqDb}
          onChange={onBassEqChange}
          onReset={() => onBassEqChange(0)}
          min={BASS_EQ_MIN_DB}
          max={BASS_EQ_MAX_DB}
          step={BASS_EQ_STEP_DB}
        />

        <ControlRow
          canAdjust={canAdjust}
          label="Virtual Bass · Harmonic Synthesis"
          secondaryLabel="Missing-fundamental enhancement"
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
  label: string
  secondaryLabel: string
  value: number
  onChange: (value: number) => void
  onReset: () => void
  min: number
  max: number
  step: number
}

function ControlRow({
  canAdjust,
  label,
  secondaryLabel,
  value,
  onChange,
  onReset,
  min,
  max,
  step,
}: ControlRowProps) {
  return (
    <div className="rounded-sm border border-ozone-border bg-black/35 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ozone-text">
            {label}
          </p>
          <p className="mt-1 text-[0.58rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted">
            {secondaryLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-[5.25rem] text-right text-[0.82rem] font-mono font-bold text-ozone-accent">
            {formatDb(value)}
          </span>
          <button
            type="button"
            className={cn(
              'btn-technical rounded-[2px] border border-ozone-border px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-ozone-text-muted transition-all duration-200',
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
        className="block h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/18 accent-[var(--ozone-accent)] disabled:cursor-not-allowed disabled:opacity-35"
      />

      <div className="mt-2 flex items-center justify-between text-[0.55rem] font-mono text-ozone-text-muted/85">
        <span>{formatDb(min)}</span>
        <span>{formatDb(max)}</span>
      </div>
    </div>
  )
}

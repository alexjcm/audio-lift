import {
  BASS_EQ_MAX_DB,
  BASS_EQ_MIN_DB,
  BASS_EQ_STEP_DB,
  VIRTUAL_BASS_MAX_DB,
  VIRTUAL_BASS_MIN_DB,
  VIRTUAL_BASS_STEP_DB,
} from '../lib/constants'
import { formatDb } from '../lib/formatters'
import { useRafSliderValue } from '../hooks/useRafSliderValue'
import { compactPanelClass } from '../lib/ui'
import { PremiumSlider } from './PremiumSlider'

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
          desktopLabel="Bass EQ · Low-End EQ"
          mobileLabel="Bass EQ"
          isActive={bassEqDb > 0}
          value={bassEqDb}
          onChange={onBassEqChange}
          min={BASS_EQ_MIN_DB}
          max={BASS_EQ_MAX_DB}
          step={BASS_EQ_STEP_DB}
        />

        <ControlRow
          canAdjust={canAdjust}
          desktopLabel="Virtual Bass · Bass Enhancement"
          mobileLabel="Virtual Bass"
          isActive={virtualBassDb > 0}
          value={virtualBassDb}
          onChange={onVirtualBassChange}
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
  desktopLabel: string
  mobileLabel: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}

function ControlRow({
  canAdjust,
  isActive = false,
  desktopLabel,
  mobileLabel,
  value,
  onChange,
  min,
  max,
  step,
}: ControlRowProps) {
  const slider = useRafSliderValue({
    value,
    onChange,
  })

  return (
    <div className="rounded-sm border border-ozone-border bg-black/35 p-2.5 max-[720px]:p-2 md:p-3">
      <div className="mb-1.5 flex items-start justify-between gap-2 md:mb-3 md:gap-3">
        <div className="min-w-0 flex items-center gap-1.5">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.05em] text-ozone-text md:text-[0.68rem] md:tracking-[0.06em]">
            <span className="md:hidden">{mobileLabel}</span>
            <span className="hidden md:inline">{desktopLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="min-w-[4rem] text-right text-[0.72rem] font-mono font-bold text-ozone-accent md:min-w-[5.25rem] md:text-[0.82rem]">
            {formatDb(slider.displayValue)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[0.65rem] font-mono text-ozone-text-muted/85">
          {formatDb(min)}
        </span>

        <PremiumSlider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          disabled={!canAdjust}
          isHighlighted={isActive}
          ariaLabel={desktopLabel}
        />

        <span className="shrink-0 text-[0.65rem] font-mono text-ozone-text-muted/85">
          {formatDb(max)}
        </span>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
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
          'btn-technical inline-flex self-start items-center justify-center gap-2 rounded-[2px] border border-ozone-border px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-ozone-text-muted transition-all duration-200',
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
                  'relative w-full max-h-[82vh] overflow-y-auto rounded-b-none border-x-0 border-b-0 border-ozone-border-bright bg-[#0d1118]/98 p-4 shadow-[0_-14px_32px_-18px_rgba(0,0,0,0.85)] md:h-full md:max-h-none md:w-[min(24rem,100vw)] lg:w-[25rem] md:rounded-none md:border-y-0 md:border-r-0 md:px-5 md:py-4 md:shadow-[-18px_0_40px_-24px_rgba(0,0,0,0.88)]',
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
                      className="btn-technical rounded-[2px] border border-ozone-border px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent"
                      onClick={onReset}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn-technical inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-ozone-border text-ozone-text-muted transition-all duration-200 hover:border-ozone-accent/35 hover:text-ozone-accent"
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

                    <div className="mb-2.5 rounded-sm border border-ozone-accent/12 bg-ozone-accent/5 px-2.5 py-1.5">
                      <p className="text-[0.54rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/85">
                        Low must stay below High
                      </p>
                    </div>

                    <div className="grid gap-2.5">
                      <SettingRow
                        label="Bass EQ Low"
                        description="Lower edge"
                        value={bassEqLowHz}
                        min={BASS_EQ_FREQ_MIN_HZ}
                        max={Math.max(BASS_EQ_FREQ_MIN_HZ, bassEqHighHz - 1)}
                        onChange={onBassEqLowChange}
                      />

                      <SettingRow
                        label="Bass EQ High"
                        description="Upper edge"
                        value={bassEqHighHz}
                        min={Math.min(BASS_EQ_FREQ_MAX_HZ, bassEqLowHz + 1)}
                        max={BASS_EQ_FREQ_MAX_HZ}
                        onChange={onBassEqHighChange}
                      />
                    </div>
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
              </div>
            </div>,
            document.body,
          )
        : null}
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
        className="block h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/18 accent-[var(--ozone-accent)]"
      />

      <div className="mt-1.5 flex items-center justify-between text-[0.5rem] font-mono text-ozone-text-muted/70">
        <span>Min {formatHz(min)}</span>
        <span>Max {formatHz(max)}</span>
      </div>
    </div>
  )
}

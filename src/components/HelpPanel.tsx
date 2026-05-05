import { useState } from 'react'
import { compactPanelClass } from '../lib/ui'

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className={compactPanelClass}>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left group"
        aria-expanded={isOpen}
        aria-controls="app-help-panel"
        onClick={() => setIsOpen((value) => !value)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-ozone-border bg-black/40 group-hover:border-ozone-accent/50 group-hover:glow-cyan transition-all">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ozone-text-muted group-hover:text-ozone-accent" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m0 4h.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-technical text-ozone-text-muted group-hover:text-ozone-text transition-colors">Information</span>
        </div>
        <span className="text-[0.6rem] font-mono text-ozone-text-muted opacity-40">
          VER {__APP_VERSION__}
        </span>
      </button>

      {isOpen ? (
        <div id="app-help-panel" className="mt-4 grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[0.7rem] leading-relaxed text-ozone-text-muted border-l border-ozone-accent/30 pl-3">
            PWA local-first para aumentar la ganancia del audio sin subir tu video.
          </p>
          <p className="text-[0.7rem] leading-relaxed text-ozone-text-muted border-l border-ozone-border pl-3">
            Analiza con medición EBU R128, ajusta manualmente en dB y exporta un archivo nuevo preservando el video cuando el pipeline lo permite.
          </p>
        </div>
      ) : null}
    </section>
  )
}

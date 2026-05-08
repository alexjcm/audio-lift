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
        </div>
        <span className="text-[0.6rem] font-mono text-ozone-text-muted opacity-40">
          Version {__APP_VERSION__}
        </span>
      </button>

      {isOpen ? (
        <div id="app-help-panel" className="mt-4 grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[0.7rem] leading-relaxed text-ozone-text-muted border-l border-ozone-accent/30 pl-3">
            Local-first PWA to increase audio gain without uploading your video.
          </p>
          <p className="text-[0.7rem] leading-relaxed text-ozone-text-muted border-l border-ozone-border pl-3">
            Analyze with EBU R128 loudness measurement, adjust gain and low-end processing in dB, and export a new file while preserving the original video whenever the pipeline allows it.
          </p>

          <div className="mt-2 flex flex-col gap-2 border-l border-ozone-border pl-3 pt-2">
            <span className="text-[0.65rem] font-bold text-ozone-text uppercase tracking-wider">
              Audio Terminology
            </span>

            <div className="text-[0.65rem] leading-relaxed">
              <span className="font-mono text-ozone-accent">Clipping:</span> 
              <span className="text-ozone-text-muted ml-1">When audio exceeds the available digital headroom, cutting off waveform peaks and causing audible distortion.</span>
            </div>

            <div className="text-[0.65rem] leading-relaxed">
              <span className="font-mono text-ozone-accent">Gain (dB):</span> 
              <span className="text-ozone-text-muted ml-1">The amount of raw amplification applied to the audio. An increase of +3 dB effectively doubles the sound power.</span>
            </div>
            
            <div className="text-[0.65rem] leading-relaxed">
              <span className="font-mono text-ozone-accent">LUFS:</span> 
              <span className="text-ozone-text-muted ml-1">Measures perceived human loudness. It is the standard used by streaming platforms like Spotify and YouTube.</span>
            </div>

            <div className="text-[0.65rem] leading-relaxed">
              <span className="font-mono text-ozone-accent">dBTP (True Peak):</span> 
              <span className="text-ozone-text-muted ml-1">Measures inter-sample peaks that can overload DACs and codecs. This app targets a safety ceiling of -1.0 dBTP.</span>
            </div>

            <div className="text-[0.65rem] leading-relaxed">
              <span className="font-mono text-ozone-accent">Virtual Bass:</span> 
              <span className="text-ozone-text-muted ml-1">Generates audible harmonics from low-frequency content so small speakers suggest more bass than they can physically reproduce.</span>
            </div>

            <div className="text-[0.65rem] leading-relaxed">
              <span className="font-mono text-ozone-accent">EBU R128:</span> 
              <span className="text-ozone-text-muted ml-1">The international broadcast standard dictating optimal levels to prevent audio distortion.</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

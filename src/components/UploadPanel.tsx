import type { ChangeEvent } from 'react'
import { panelClass } from '../lib/ui'

type UploadPanelProps = {
  onFileSelection: (file: File) => Promise<void>
}

export function UploadPanel({ onFileSelection }: UploadPanelProps) {
  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await onFileSelection(file)
    event.target.value = ''
  }

  return (
    <section className={panelClass}>
      <label
        className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-ozone-border-bright bg-black/20 px-4 py-6 transition-all hover:bg-black/40 hover:border-ozone-accent/50 group max-[720px]:min-h-[40px] max-[720px]:flex-row max-[720px]:py-2 max-[720px]:gap-3"
        htmlFor="video-input"
      >
        <input
          id="video-input"
          type="file"
          accept=".mp4,.mov,video/mp4,video/quicktime"
          onChange={handleFileInput}
          className="pointer-events-none absolute opacity-0"
        />
        <svg viewBox="0 0 24 24" className="w-6 h-6 mb-2 text-ozone-text-muted group-hover:text-ozone-accent group-hover:glow-cyan transition-all max-[720px]:mb-0 max-[720px]:w-5 max-[720px]:h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex flex-col items-center max-[720px]:items-start">
          <strong className="text-technical text-ozone-text transition-colors group-hover:text-ozone-accent max-[720px]:text-[0.65rem]">
            Import Media
          </strong>
          <span className="text-[0.6rem] text-technical text-ozone-text-muted mt-1 max-[720px]:hidden">MP4, MOV...</span>
        </div>
      </label>
    </section>
  )
}


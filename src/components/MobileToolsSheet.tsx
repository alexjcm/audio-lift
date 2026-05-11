import { useMemo, useState, useEffect } from 'react'
import { InformationContent } from './HelpPanel'
import {
  MediaAnalysisContent,
} from './MediaTechnicalPanel'
import {
  SettingsContent,
} from './SettingsPanel'
import { cn, panelClass } from '../lib/ui'
import { BottomSheet } from './BottomSheet'
import { IconChevronUp, IconClose } from './Icons'
import type { AudioAnalysis, DerivedAnalysis, MediaSummary } from '../types'

type MobileToolsSheetView = 'analysis' | 'settings' | 'info'

type MobileToolsSheetProps = {
  bassEqHighHz: number
  bassEqLowHz: number
  baseAnalysis: AudioAnalysis | null
  derivedAnalysis: DerivedAnalysis | null
  mediaSummary: MediaSummary | null
  onBassEqHighChange: (value: number) => void
  onBassEqLowChange: (value: number) => void
  onReset: () => void
  onVirtualBassCutoffChange: (value: number) => void
  onVirtualBassDriveChange: (value: number) => void
  onTargetTruePeakChange: (value: number) => void
  selectedFile: File | null
  virtualBassCutoffHz: number
  virtualBassDrive: number
  targetTruePeakDbtp: number
}

const VIEW_ITEMS: Array<{
  id: MobileToolsSheetView
  label: string
}> = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'settings', label: 'Settings' },
  { id: 'info', label: 'Info' },
]

export function MobileToolsSheet({
  bassEqHighHz,
  bassEqLowHz,
  baseAnalysis,
  derivedAnalysis,
  mediaSummary,
  onBassEqHighChange,
  onBassEqLowChange,
  onReset,
  onVirtualBassCutoffChange,
  onVirtualBassDriveChange,
  onTargetTruePeakChange,
  selectedFile,
  virtualBassCutoffHz,
  virtualBassDrive,
  targetTruePeakDbtp,
}: MobileToolsSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeView, setActiveView] = useState<MobileToolsSheetView>('analysis')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setActiveView('analysis')
  }, [isOpen])

  const content = useMemo(() => {
    switch (activeView) {
      case 'settings':
        return (
          <div className="grid gap-3">
            <div className="flex items-start justify-between gap-3 border-b border-ozone-border pb-3">
              <div>
                <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ozone-accent">
                  Global Settings
                </h2>
              </div>

              <button
                type="button"
                className="btn-technical min-h-10 px-3 py-2 text-[0.55rem] tracking-[0.08em]"
                onClick={onReset}
              >
                Reset
              </button>
            </div>

            <SettingsContent
              bassEqHighHz={bassEqHighHz}
              bassEqLowHz={bassEqLowHz}
              onBassEqHighChange={onBassEqHighChange}
              onBassEqLowChange={onBassEqLowChange}
              onVirtualBassCutoffChange={onVirtualBassCutoffChange}
              onVirtualBassDriveChange={onVirtualBassDriveChange}
              onTargetTruePeakChange={onTargetTruePeakChange}
              virtualBassCutoffHz={virtualBassCutoffHz}
              virtualBassDrive={virtualBassDrive}
              targetTruePeakDbtp={targetTruePeakDbtp}
            />
          </div>
        )
      case 'info':
        return (
          <div className="grid gap-3 rounded-sm border border-ozone-border-bright bg-black/35 p-3">
            <div className="flex items-center justify-between gap-3 border-b border-ozone-border pb-3">
              <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ozone-accent">
                Information
              </h2>
              <span className="text-[0.52rem] font-mono uppercase tracking-[0.08em] text-ozone-text-muted/70">
                Audio Lift
              </span>
            </div>
            <InformationContent />
          </div>
        )
      case 'analysis':
      default:
        return (
          <MediaAnalysisContent
            mediaSummary={mediaSummary}
            selectedFile={selectedFile}
            baseAnalysis={baseAnalysis}
            derivedAnalysis={derivedAnalysis}
          />
        )
    }
  }, [
    activeView,
    bassEqHighHz,
    bassEqLowHz,
    baseAnalysis,
    derivedAnalysis,
    mediaSummary,
    onBassEqHighChange,
    onBassEqLowChange,
    onReset,
    onVirtualBassCutoffChange,
    onVirtualBassDriveChange,
    onTargetTruePeakChange,
    selectedFile,
    virtualBassCutoffHz,
    virtualBassDrive,
    targetTruePeakDbtp,
  ])

  return (
    <>
      <button
        type="button"
        className={cn(
          'btn-technical fixed right-4 z-[80] min-h-12 gap-2 rounded-full px-4 py-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.82)] backdrop-blur md:hidden',
          'border-ozone-accent/35 bg-[#0f151f]/96 text-ozone-accent hover:border-ozone-accent/60 hover:bg-ozone-accent/12 hover:text-ozone-accent',
          isOpen && 'border-ozone-accent/60 bg-ozone-accent/12 text-ozone-accent glow-cyan',
        )}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open more tools"
        onClick={() => setIsOpen(true)}
      >
        <IconChevronUp className="h-4 w-4" aria-hidden="true" />
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.08em]">
          More
        </span>
      </button>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        closeLabel="Close more tools"
        containerClassName="fixed inset-0 z-[90] flex items-end md:hidden"
        backdropClassName="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-[1px]"
      >
              <div
                className={cn(
                  panelClass,
                  'relative flex h-[68svh] max-h-[68svh] w-full flex-col overflow-hidden rounded-b-none border-x-0 border-b-0 border-ozone-border-bright bg-[#0d1118]/98 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] shadow-[0_-14px_32px_-18px_rgba(0,0,0,0.85)]',
                )}
                role="dialog"
                aria-modal="true"
                aria-label="More tools"
              >
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="h-1.5 w-14 rounded-full bg-white/12" />

                  <button
                    type="button"
                    className="btn-technical h-9 w-9"
                    aria-label="Close more tools"
                    onClick={() => setIsOpen(false)}
                  >
                    <IconClose className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-3 gap-1.5 rounded-sm border border-ozone-border bg-black/35 p-0.5">
                  {VIEW_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        'btn-technical flex min-h-8 px-2 py-1 text-[0.58rem] tracking-[0.06em]',
                        activeView === item.id
                          ? 'border border-ozone-accent/30 bg-ozone-accent/10 text-ozone-accent glow-cyan'
                          : 'text-ozone-text-muted hover:text-ozone-text',
                      )}
                      aria-pressed={activeView === item.id}
                      onClick={() => setActiveView(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-1">
                  {content}
                </div>
              </div>
      </BottomSheet>
    </>
  )
}

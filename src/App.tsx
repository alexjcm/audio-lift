import { ActionsPanel } from './components/ActionsPanel'
import { BassControlPanel } from './components/BassControlPanel'
import { MediaTechnicalPanel } from './components/MediaTechnicalPanel'
import { BlockingIssuePanel } from './components/BlockingIssuePanel'
import { ExportReadyPanel } from './components/ExportReadyPanel'
import { GainControlPanel } from './components/GainControlPanel'
import { HelpPanel } from './components/HelpPanel'
import { PlaybackSupportPanel } from './components/PlaybackSupportPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { useAudioLiftWorkflow } from './hooks/useAudioLiftWorkflow'

function App() {
  const workflow = useAudioLiftWorkflow()

  return (
    <main className="mx-auto w-[min(1280px,100%)] min-h-screen bg-ozone-bg selection:bg-ozone-accent selection:text-ozone-bg">
      <div className="px-4 pb-4 pt-0 md:p-6 lg:p-8">
        <div className="mb-3 md:mb-6">
          <SettingsPanel
            bassEqHighHz={workflow.bassEqHighHz}
            bassEqLowHz={workflow.bassEqLowHz}
            onBassEqHighChange={workflow.handleBassEqHighChange}
            onBassEqLowChange={workflow.handleBassEqLowChange}
            onReset={workflow.handleResetGlobalSettings}
            onVirtualBassCutoffChange={workflow.handleVirtualBassCutoffChange}
            virtualBassCutoffHz={workflow.virtualBassCutoffHz}
          />
        </div>

        <section className="grid grid-cols-1 items-start gap-3 md:gap-6 lg:justify-center lg:grid-cols-[560px_400px]">
          {/* Left Column: Primary Visualizer & Core Workflow */}
          <div className="grid gap-3 md:gap-6">
            <PreviewPanel
              activeVideoSrc={workflow.activeVideoSrc}
              currentTime={workflow.currentTime}
              duration={workflow.duration}
              fileName={workflow.selectedFile?.name ?? null}
              isPlaying={workflow.isPlaying}
              onFileSelection={workflow.handleFileSelection}
              onEnded={workflow.handleVideoEnded}
              onLoadedMetadata={workflow.handleVideoLoadedMetadata}
              onPause={workflow.handleVideoPause}
              onPlay={workflow.handleVideoPlay}
              onPlayPause={workflow.handlePlayPause}
              onPreviewModeChange={workflow.handlePreviewModeChange}
              onSeekChange={workflow.handleSeekChange}
              onTimeUpdate={workflow.handleVideoTimeUpdate}
              previewMode={workflow.previewMode}
              videoRef={workflow.videoRef}
            />
          </div>

          {/* Right Column: Controls & Analytics */}
          <div className="grid gap-3 md:gap-6">
            {workflow.playbackSupport ? (
              <PlaybackSupportPanel playbackSupport={workflow.playbackSupport} />
            ) : null}

            {workflow.blockingIssue ? (
              <BlockingIssuePanel issue={workflow.blockingIssue} />
            ) : null}

            {workflow.selectedFile ? (
              <div className="grid animate-in gap-3 fade-in slide-in-from-right-4 duration-500 md:gap-6">
                <MediaTechnicalPanel
                  mediaSummary={workflow.mediaSummary}
                  selectedFile={workflow.selectedFile}
                  baseAnalysis={workflow.baseAnalysis}
                  derivedAnalysis={workflow.derivedAnalysis}
                />

                <GainControlPanel
                  canAdjustVolume={workflow.canAdjustVolume}
                  derivedAnalysis={workflow.derivedAnalysis}
                  feedbackMessages={workflow.feedbackMessages}
                  gainDb={workflow.gainDb}
                  onGainChange={workflow.handleGainChange}
                />

                <BassControlPanel
                  bassEqDb={workflow.bassEqDb}
                  bassEqHighHz={workflow.bassEqHighHz}
                  bassEqLowHz={workflow.bassEqLowHz}
                  canAdjust={workflow.canAdjustVolume}
                  onBassEqChange={workflow.handleBassEqChange}
                  onVirtualBassChange={workflow.handleVirtualBassChange}
                  virtualBassDb={workflow.virtualBassDb}
                />

                {workflow.canAdjustVolume ? (
                  <ActionsPanel
                    onExport={workflow.handleExport}
                    phase={workflow.phase}
                    virtualBassActive={workflow.virtualBassDb > 0}
                  />
                ) : null}
              </div>
            ) : (
              <div className="ozone-panel p-12 flex flex-col items-center justify-center text-center opacity-20">
                <svg viewBox="0 0 24 24" className="w-12 h-12 mb-4 text-ozone-text-muted" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 10h18M9 14h6" />
                </svg>
                <p className="text-technical">Load a file to enable controls</p>
              </div>
            )}

            {workflow.exportAsset ? (
              <ExportReadyPanel
                exportAsset={workflow.exportAsset}
              />
            ) : null}

            <HelpPanel />
          </div>
        </section>
      </div>
    </main>
  )
}



export default App

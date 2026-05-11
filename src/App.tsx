import { ActionsPanel } from './components/ActionsPanel'
import { BassControlPanel } from './components/BassControlPanel'
import { MediaTechnicalPanel } from './components/MediaTechnicalPanel'
import { BlockingIssuePanel } from './components/BlockingIssuePanel'
import { GainControlPanel } from './components/GainControlPanel'
import { HelpPanel } from './components/HelpPanel'
import { MobileToolsSheet } from './components/MobileToolsSheet'
import { IconPlaceholder } from './components/Icons'
import { PlaybackSupportPanel } from './components/PlaybackSupportPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { useAudioLiftWorkflow } from './hooks/useAudioLiftWorkflow'

function App() {
  const workflow = useAudioLiftWorkflow()

  return (
    <main className="mx-auto w-[min(1280px,100%)] min-h-screen bg-ozone-bg selection:bg-ozone-accent selection:text-ozone-bg">
      <div className="mobile-floating-clearance px-4 pt-0 md:p-6 lg:p-8">
        <div className="mb-0 md:mb-6">
          <SettingsPanel
            bassEqHighHz={workflow.bassEqHighHz}
            bassEqLowHz={workflow.bassEqLowHz}
            onBassEqHighChange={workflow.handleBassEqHighChange}
            onBassEqLowChange={workflow.handleBassEqLowChange}
            onReset={workflow.handleResetGlobalSettings}
            onVirtualBassCutoffChange={workflow.handleVirtualBassCutoffChange}
            onVirtualBassDriveChange={workflow.handleVirtualBassDriveChange}
            onTargetTruePeakChange={workflow.handleTargetTruePeakChange}
            showMobileFloatingButton={false}
            virtualBassCutoffHz={workflow.virtualBassCutoffHz}
            virtualBassDrive={workflow.virtualBassDrive}
            targetTruePeakDbtp={workflow.targetTruePeakDbtp}
          />
        </div>

        <section className="grid grid-cols-1 items-start gap-3 md:gap-6 lg:justify-center lg:grid-cols-[560px_400px]">
          {/* Left Column: Primary Visualizer & Core Workflow */}
          <div className="grid gap-3 md:gap-6">
            <PreviewPanel
              activeVideoSrc={workflow.activeVideoSrc}
              fileName={workflow.selectedFile?.name ?? null}
              importWorkflowStatusMessage={workflow.importWorkflowStatusMessage}
              isPlaying={workflow.isPlaying}
              onFileSelection={workflow.handleFileSelection}
              onEnded={workflow.handleVideoEnded}
              onLoadedMetadata={workflow.handleVideoLoadedMetadata}
              onPause={workflow.handleVideoPause}
              onPlay={workflow.handleVideoPlay}
              onPlayPause={workflow.handlePlayPause}
              onPreviewModeChange={workflow.handlePreviewModeChange}
              onSeekChange={workflow.handleSeekChange}
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
                <div className="hidden md:block">
                  <MediaTechnicalPanel
                    mediaSummary={workflow.mediaSummary}
                    selectedFile={workflow.selectedFile}
                    baseAnalysis={workflow.baseAnalysis}
                    derivedAnalysis={workflow.derivedAnalysis}
                  />
                </div>

                <GainControlPanel
                  canAdjustVolume={workflow.canAdjustVolume}
                  derivedAnalysis={workflow.derivedAnalysis}
                  feedbackMessages={workflow.feedbackMessages}
                  gainDb={workflow.gainDb}
                  onGainChange={workflow.handleGainChange}
                />

                <BassControlPanel
                  bassEqDb={workflow.bassEqDb}
                  canAdjust={workflow.canAdjustVolume}
                  onBassEqChange={workflow.handleBassEqChange}
                  onVirtualBassChange={workflow.handleVirtualBassChange}
                  virtualBassDb={workflow.virtualBassDb}
                />

                {workflow.canAdjustVolume ? (
                  <ActionsPanel
                    engineStatus={workflow.engineStatus}
                    engineStatusMessage={workflow.engineStatusMessage}
                    mobileRenderWarning={workflow.mobileRenderWarning}
                    onExport={workflow.handleExport}
                    phase={workflow.phase}
                  />
                ) : null}
              </div>
            ) : (
              <div className="ozone-panel p-12 flex flex-col items-center justify-center text-center opacity-20">
                <IconPlaceholder className="w-12 h-12 mb-4 text-ozone-text-muted" />
                <p className="text-technical">Load a file to enable controls</p>
              </div>
            )}

            <div className="hidden md:block">
              <HelpPanel />
            </div>
          </div>
        </section>

        <MobileToolsSheet
          bassEqHighHz={workflow.bassEqHighHz}
          bassEqLowHz={workflow.bassEqLowHz}
          baseAnalysis={workflow.baseAnalysis}
          derivedAnalysis={workflow.derivedAnalysis}
          mediaSummary={workflow.mediaSummary}
          onBassEqHighChange={workflow.handleBassEqHighChange}
          onBassEqLowChange={workflow.handleBassEqLowChange}
          onReset={workflow.handleResetGlobalSettings}
          onVirtualBassCutoffChange={workflow.handleVirtualBassCutoffChange}
          onVirtualBassDriveChange={workflow.handleVirtualBassDriveChange}
          onTargetTruePeakChange={workflow.handleTargetTruePeakChange}
          selectedFile={workflow.selectedFile}
          virtualBassCutoffHz={workflow.virtualBassCutoffHz}
          virtualBassDrive={workflow.virtualBassDrive}
          targetTruePeakDbtp={workflow.targetTruePeakDbtp}
        />
      </div>
    </main>
  )
}



export default App

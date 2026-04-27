import { ActionsPanel } from './components/ActionsPanel'
import { MediaTechnicalPanel } from './components/MediaTechnicalPanel'
import { BlockingIssuePanel } from './components/BlockingIssuePanel'
import { ExportReadyPanel } from './components/ExportReadyPanel'
import { GainControlPanel } from './components/GainControlPanel'
import { HelpPanel } from './components/HelpPanel'
import { PlaybackSupportPanel } from './components/PlaybackSupportPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { UploadPanel } from './components/UploadPanel'
import { useAudioLiftWorkflow } from './hooks/useAudioLiftWorkflow'

function App() {
  const workflow = useAudioLiftWorkflow()

  return (
    <main className="mx-auto w-[min(1280px,100%)] min-h-screen bg-ozone-bg selection:bg-ozone-accent selection:text-ozone-bg">
      <div className="p-4 md:p-6 lg:p-8">
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
          {/* Left Column: Primary Visualizer & Core Workflow */}
          <div className="grid gap-6">
            <PreviewPanel
              activeVideoSrc={workflow.activeVideoSrc}
              onLoadedMetadata={workflow.handleVideoLoadedMetadata}
              onPreviewModeChange={workflow.handlePreviewModeChange}
              onTimeUpdate={workflow.handleVideoTimeUpdate}
              previewAsset={workflow.previewAsset}
              previewMode={workflow.previewMode}
              videoRef={workflow.videoRef}
            />

            <UploadPanel
              onFileSelection={workflow.handleFileSelection}
            />
          </div>

          {/* Right Column: Controls & Analytics */}
          <div className="grid gap-6">
            {workflow.playbackSupport ? (
              <PlaybackSupportPanel playbackSupport={workflow.playbackSupport} />
            ) : null}

            {workflow.blockingIssue ? (
              <BlockingIssuePanel issue={workflow.blockingIssue} />
            ) : null}

            {workflow.selectedFile ? (
              <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <MediaTechnicalPanel
                  mediaSummary={workflow.mediaSummary}
                  selectedFile={workflow.selectedFile}
                  phase={workflow.phase}
                  baseAnalysis={workflow.baseAnalysis}
                  derivedAnalysis={workflow.derivedAnalysis}
                />

                <GainControlPanel
                  canAdjustVolume={workflow.canAdjustVolume}
                  derivedAnalysis={workflow.derivedAnalysis}
                  feedbackMessages={workflow.feedbackMessages}
                  gainDb={workflow.gainDb}
                  onGainChange={workflow.setGainDb}
                />

                {workflow.canAdjustVolume ? (
                  <ActionsPanel
                    onExport={workflow.handleExport}
                    onGeneratePreview={workflow.handleGeneratePreview}
                    phase={workflow.phase}
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
                gainDb={workflow.gainDb}
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

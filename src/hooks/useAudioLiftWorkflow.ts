import { startTransition, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_BASS_EQ_DB,
  DEFAULT_GAIN_DB,
  DEFAULT_VIRTUAL_BASS_DB,
  SETTINGS_STORAGE_KEY,
} from '../lib/constants'
import { isLikelyAppleMobileDevice } from '../lib/deviceProfile'
import { triggerFileDownload } from '../lib/exportDelivery'
import { browserMediaEngine } from '../lib/ffmpeg'
import { LivePreviewEngine } from '../lib/livePreview'
import {
  clampBassEqHighHz,
  clampBassEqLowHz,
  clampVirtualBassCutoffHz,
  getDefaultGlobalSettings,
  normalizeGlobalSettings,
} from '../lib/virtualBass'
import {
  assessBrowserPlaybackSupport,
  buildDerivedAnalysis,
  buildMediaSummary,
  getBlockingIssue,
  getFeedbackMessages,
  getMobileRenderWarning,
  validateSelectedFile,
} from '../lib/validation'
import type {
  AudioAnalysis,
  BrowserPlaybackSupport,
  EngineStatus,
  GlobalSettings,
  MediaSummary,
  PreviewMode,
  ProcessingPhase,
  ValidationIssue,
} from '../types'

export function useAudioLiftWorkflow() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const requestIdRef = useRef(0)
  const livePreviewRef = useRef<LivePreviewEngine | null>(null)
  const selectedFileUrlRef = useRef<string | null>(null)

  if (!livePreviewRef.current) {
    livePreviewRef.current = new LivePreviewEngine()
  }

  const livePreview = livePreviewRef.current

  const [phase, setPhase] = useState<ProcessingPhase>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  const [mediaSummary, setMediaSummary] = useState<MediaSummary | null>(null)
  const [baseAnalysis, setBaseAnalysis] = useState<AudioAnalysis | null>(null)
  const [playbackSupport, setPlaybackSupport] =
    useState<BrowserPlaybackSupport | null>(null)
  const [gainDb, setGainDb] = useState(DEFAULT_GAIN_DB)
  const [bassEqDb, setBassEqDb] = useState(DEFAULT_BASS_EQ_DB)
  const [virtualBassDb, setVirtualBassDb] = useState(DEFAULT_VIRTUAL_BASS_DB)
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('not_ready')
  const [engineStatusMessage, setEngineStatusMessage] = useState<string | null>(
    null,
  )
  const [importWorkflowStatusMessage, setImportWorkflowStatusMessage] =
    useState<string | null>(null)
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() =>
    loadGlobalSettings(),
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>('original')
  const [blockingIssue, setBlockingIssue] = useState<ValidationIssue | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const isAppleMobileDevice = isLikelyAppleMobileDevice()
  const shouldWarnForMobile = isAppleMobileDevice

  const {
    bassEqLowHz,
    bassEqHighHz,
    virtualBassCutoffHz,
  } = globalSettings

  useEffect(() => {
    livePreview.setGainDb(gainDb)
  }, [gainDb, livePreview])

  useEffect(() => {
    livePreview.setBassEqDb(bassEqDb)
  }, [bassEqDb, livePreview])

  useEffect(() => {
    livePreview.setBassEqRange(bassEqLowHz, bassEqHighHz)
  }, [bassEqHighHz, bassEqLowHz, livePreview])

  useEffect(() => {
    livePreview.setVirtualBassDb(virtualBassDb)
  }, [virtualBassDb, livePreview])

  useEffect(() => {
    livePreview.setVirtualBassCutoffHz(virtualBassCutoffHz)
  }, [virtualBassCutoffHz, livePreview])

  useEffect(() => {
    livePreview.setMode(previewMode)
  }, [previewMode, livePreview])

  useEffect(() => {
    persistGlobalSettings(globalSettings)
  }, [globalSettings])

  useEffect(() => {
    return () => {
      revokeObjectUrl(selectedFileUrlRef.current)
      livePreview.destroy()
    }
  }, [livePreview])

  const derivedAnalysis = baseAnalysis
    ? buildDerivedAnalysis(baseAnalysis, gainDb, bassEqDb, virtualBassDb)
    : null
  const canAdjustVolume = Boolean(baseAnalysis && derivedAnalysis)
  const feedbackMessages = getFeedbackMessages(baseAnalysis, derivedAnalysis)
  const mobileRenderWarning = getMobileRenderWarning(
    mediaSummary,
    shouldWarnForMobile,
  )
  const activeVideoSrc = selectedFileUrl
  const hasAudioAdjustments =
    gainDb !== DEFAULT_GAIN_DB ||
    bassEqDb !== DEFAULT_BASS_EQ_DB ||
    virtualBassDb !== DEFAULT_VIRTUAL_BASS_DB

  const replaceSelectedFileUrl = (nextUrl: string | null) => {
    if (selectedFileUrlRef.current && selectedFileUrlRef.current !== nextUrl) {
      revokeObjectUrl(selectedFileUrlRef.current)
    }

    selectedFileUrlRef.current = nextUrl
    setSelectedFileUrl(nextUrl)
  }

  const resetForNewSelection = () => {
    setMediaSummary(null)
    setBaseAnalysis(null)
    setPlaybackSupport(null)
    setBlockingIssue(null)
    setPhase('idle')
    setPreviewMode('original')
    setImportWorkflowStatusMessage(null)
    setGainDb(DEFAULT_GAIN_DB)
    setBassEqDb(DEFAULT_BASS_EQ_DB)
    setVirtualBassDb(DEFAULT_VIRTUAL_BASS_DB)
    setIsPlaying(false)
    livePreview.detach()
  }

  const handleGainChange = (value: number) => {
    if (value === gainDb) {
      return
    }

    setGainDb(value)
  }

  const handleBassEqChange = (value: number) => {
    if (value === bassEqDb) {
      return
    }

    setBassEqDb(value)
  }

  const handleVirtualBassChange = (value: number) => {
    if (value === virtualBassDb) {
      return
    }

    setVirtualBassDb(value)
  }

  const handleBassEqLowChange = (value: number) => {
    setGlobalSettings((current) => {
      const next = normalizeGlobalSettings({
        ...current,
        bassEqLowHz: clampBassEqLowHz(value, current.bassEqHighHz),
      })
      return next
    })
  }

  const handleBassEqHighChange = (value: number) => {
    setGlobalSettings((current) => {
      const next = normalizeGlobalSettings({
        ...current,
        bassEqHighHz: clampBassEqHighHz(value, current.bassEqLowHz),
      })
      return next
    })
  }

  const handleVirtualBassCutoffChange = (value: number) => {
    setGlobalSettings((current) => ({
      ...current,
      virtualBassCutoffHz: clampVirtualBassCutoffHz(value),
    }))
  }

  const handleResetGlobalSettings = () => {
    setGlobalSettings(getDefaultGlobalSettings())
  }

  const handleFileSelection = async (file: File) => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    const localUrl = URL.createObjectURL(file)

    startTransition(() => {
      resetForNewSelection()
      setSelectedFile(file)
      replaceSelectedFileUrl(localUrl)
    })

    const basicIssue = validateSelectedFile(file)
    if (basicIssue) {
      setBlockingIssue(basicIssue)
      setPhase('blocked')
      return
    }

    try {
      const engineWasReady = browserMediaEngine.isLoaded()
      setEngineStatus(engineWasReady ? 'ready' : 'preparing')
      setEngineStatusMessage(
        engineWasReady ? null : 'Preparing local export engine...',
      )
      setImportWorkflowStatusMessage(
        engineWasReady ? 'Reading media details...' : 'Preparing local export engine...',
      )

      await browserMediaEngine.load()

      if (requestId !== requestIdRef.current) {
        return
      }

      setEngineStatus('ready')
      setEngineStatusMessage(null)
      setImportWorkflowStatusMessage('Reading media details...')

      const probeResult = await browserMediaEngine.probe(file)

      if (requestId !== requestIdRef.current) {
        return
      }

      const summary = buildMediaSummary(probeResult, file)
      const issue = getBlockingIssue(summary)

      startTransition(() => {
        setMediaSummary(summary)
        setBlockingIssue(issue)
      })

      if (issue) {
        setImportWorkflowStatusMessage(null)
        setPhase('blocked')
        return
      }

      setImportWorkflowStatusMessage('Checking browser playback...')
      const supportPromise = assessBrowserPlaybackSupport(summary)
      const analysisPromise = browserMediaEngine.analyze(file)

      const support = await supportPromise

      if (requestId !== requestIdRef.current) {
        return
      }

      startTransition(() => {
        setPlaybackSupport(support)
      })

      setImportWorkflowStatusMessage('Analyzing audio...')
      const exactAnalysis = await analysisPromise

      if (requestId !== requestIdRef.current) {
        return
      }

      startTransition(() => {
        setBaseAnalysis(exactAnalysis)
        setPhase('ready')
      })
      setImportWorkflowStatusMessage(null)
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return
      }

      const message =
        error instanceof Error ? error.message : 'Unexpected error'

      setEngineStatus('failed')
      setEngineStatusMessage(
        'The local export engine needs a first successful online load before it can be reused offline.',
      )
      setImportWorkflowStatusMessage(null)
      setPhase('error')
      setBlockingIssue({
        code: 'analysis-failed',
        message,
        canRecover: true,
      })
    }
  }

  const handleExport = async () => {
    if (!selectedFile || !derivedAnalysis) {
      return
    }

    if (!hasAudioAdjustments) {
      const originalUrl = URL.createObjectURL(selectedFile)
      triggerFileDownload(originalUrl, selectedFile.name)
      window.setTimeout(() => {
        revokeObjectUrl(originalUrl)
      }, 5_000)
      return
    }

    setPhase('exporting')

    try {
      const result = await browserMediaEngine.exportAdjustedFile(
        selectedFile,
        {
          gainDb: derivedAnalysis.gainDb,
          bassEqDb,
          bassEqLowHz,
          bassEqHighHz,
          virtualBassDb,
          virtualBassCutoffHz,
        },
        () => {},
      )

      const exportUrl = URL.createObjectURL(result.blob)
      triggerFileDownload(exportUrl, result.name)
      window.setTimeout(() => {
        revokeObjectUrl(exportUrl)
      }, 5_000)
      setPhase('ready')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error exporting file'

      setPhase('error')
      setBlockingIssue({
        code: 'export-failed',
        message,
        canRecover: true,
      })
    }
  }

  const handlePreviewModeChange = (mode: PreviewMode) => {
    if (mode === 'adjusted' && !selectedFileUrl) {
      return
    }

    setPreviewMode(mode)
  }

  const handleVideoLoadedMetadata = () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    livePreview.attach(element)
    livePreview.setGainDb(gainDb)
    livePreview.setBassEqDb(bassEqDb)
    livePreview.setBassEqRange(bassEqLowHz, bassEqHighHz)
    livePreview.setVirtualBassDb(virtualBassDb)
    livePreview.setVirtualBassCutoffHz(virtualBassCutoffHz)
    livePreview.setMode(previewMode)
  }

  const handlePlayPause = async () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    if (element.paused || element.ended) {
      try {
        await element.play()
      } catch {
        // Playback can still be blocked until the browser accepts the gesture.
      }
      return
    }

    element.pause()
  }

  const handleSeekChange = (nextTime: number) => {
    const element = videoRef.current
    if (!element) {
      return
    }

    element.currentTime = nextTime
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
  }

  return {
    activeVideoSrc,
    baseAnalysis,
    bassEqDb,
    bassEqHighHz,
    bassEqLowHz,
    blockingIssue,
    canAdjustVolume,
    derivedAnalysis,
    engineStatus,
    engineStatusMessage,
    feedbackMessages,
    gainDb,
    handleBassEqChange,
    handleBassEqHighChange,
    handleBassEqLowChange,
    handleExport,
    handleFileSelection,
    handleGainChange,
    handlePlayPause,
    handlePreviewModeChange,
    handleResetGlobalSettings,
    handleSeekChange,
    handleVideoEnded,
    handleVideoLoadedMetadata,
    handleVideoPause,
    handleVideoPlay,
    handleVirtualBassChange,
    handleVirtualBassCutoffChange,
    importWorkflowStatusMessage,
    isPlaying,
    mediaSummary,
    mobileRenderWarning,
    phase,
    playbackSupport,
    previewMode,
    selectedFile,
    videoRef,
    virtualBassCutoffHz,
    virtualBassDb,
  }
}

function revokeObjectUrl(url: string | null) {
  if (!url) {
    return
  }

  URL.revokeObjectURL(url)
}

function loadGlobalSettings() {
  if (typeof window === 'undefined') {
    return getDefaultGlobalSettings()
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!raw) {
      return getDefaultGlobalSettings()
    }

    return normalizeGlobalSettings(JSON.parse(raw) as Partial<GlobalSettings>)
  } catch {
    return getDefaultGlobalSettings()
  }
}

function persistGlobalSettings(settings: GlobalSettings) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage failures and keep runtime state alive.
  }
}

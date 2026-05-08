import { startTransition, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_BASS_EQ_DB,
  DEFAULT_GAIN_DB,
  DEFAULT_VIRTUAL_BASS_DB,
  SETTINGS_STORAGE_KEY,
} from '../lib/constants'
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
  getRenderedMasterWarnings,
  validateSelectedFile,
} from '../lib/validation'
import type {
  AudioAnalysis,
  BrowserPlaybackSupport,
  GeneratedAsset,
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
  const exportAssetRef = useRef<GeneratedAsset | null>(null)

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
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() =>
    loadGlobalSettings(),
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>('original')
  const [exportAsset, setExportAsset] = useState<GeneratedAsset | null>(null)
  const [blockingIssue, setBlockingIssue] = useState<ValidationIssue | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

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
      revokeObjectUrl(exportAssetRef.current?.url ?? null)
      livePreview.detach()
    }
  }, [livePreview])

  const derivedAnalysis = baseAnalysis
    ? buildDerivedAnalysis(baseAnalysis, gainDb, bassEqDb, virtualBassDb)
    : null
  const canAdjustVolume = Boolean(baseAnalysis && derivedAnalysis)
  const feedbackMessages = getFeedbackMessages(baseAnalysis, derivedAnalysis)
  const activeVideoSrc = selectedFileUrl

  const replaceSelectedFileUrl = (nextUrl: string | null) => {
    if (selectedFileUrlRef.current && selectedFileUrlRef.current !== nextUrl) {
      revokeObjectUrl(selectedFileUrlRef.current)
    }

    selectedFileUrlRef.current = nextUrl
    setSelectedFileUrl(nextUrl)
  }

  const replaceExportAsset = (nextAsset: GeneratedAsset | null) => {
    if (exportAssetRef.current?.url && exportAssetRef.current !== nextAsset) {
      revokeObjectUrl(exportAssetRef.current.url)
    }

    exportAssetRef.current = nextAsset
    setExportAsset(nextAsset)
  }

  const resetForNewSelection = () => {
    setMediaSummary(null)
    setBaseAnalysis(null)
    setPlaybackSupport(null)
    setBlockingIssue(null)
    setPhase('idle')
    setPreviewMode('original')
    setGainDb(DEFAULT_GAIN_DB)
    setBassEqDb(DEFAULT_BASS_EQ_DB)
    setVirtualBassDb(DEFAULT_VIRTUAL_BASS_DB)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    replaceExportAsset(null)
    livePreview.detach()
  }

  const invalidateExport = () => {
    replaceExportAsset(null)
  }

  const handleGainChange = (value: number) => {
    if (value === gainDb) {
      return
    }

    setGainDb(value)
    invalidateExport()
  }

  const handleBassEqChange = (value: number) => {
    if (value === bassEqDb) {
      return
    }

    setBassEqDb(value)
    invalidateExport()
  }

  const handleVirtualBassChange = (value: number) => {
    if (value === virtualBassDb) {
      return
    }

    setVirtualBassDb(value)
    invalidateExport()
  }

  const handleBassEqLowChange = (value: number) => {
    setGlobalSettings((current) => {
      const next = normalizeGlobalSettings({
        ...current,
        bassEqLowHz: clampBassEqLowHz(value, current.bassEqHighHz),
      })
      return next
    })
    invalidateExport()
  }

  const handleBassEqHighChange = (value: number) => {
    setGlobalSettings((current) => {
      const next = normalizeGlobalSettings({
        ...current,
        bassEqHighHz: clampBassEqHighHz(value, current.bassEqLowHz),
      })
      return next
    })
    invalidateExport()
  }

  const handleVirtualBassCutoffChange = (value: number) => {
    setGlobalSettings((current) => ({
      ...current,
      virtualBassCutoffHz: clampVirtualBassCutoffHz(value),
    }))
    invalidateExport()
  }

  const handleResetGlobalSettings = () => {
    setGlobalSettings(getDefaultGlobalSettings())
    invalidateExport()
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
      await browserMediaEngine.load()

      if (requestId !== requestIdRef.current) {
        return
      }

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
        setPhase('blocked')
        return
      }

      const support = await assessBrowserPlaybackSupport(summary)

      if (requestId !== requestIdRef.current) {
        return
      }

      startTransition(() => {
        setPlaybackSupport(support)
      })

      const exactAnalysis = await browserMediaEngine.analyze(file)

      if (requestId !== requestIdRef.current) {
        return
      }

      startTransition(() => {
        setBaseAnalysis(exactAnalysis)
        setPhase('ready')
      })
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return
      }

      const message =
        error instanceof Error ? error.message : 'Unexpected error'

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
      const warnings = getRenderedMasterWarnings(result.outputAnalysis)

      replaceExportAsset({
        name: result.name,
        sizeBytes: result.blob.size,
        url: exportUrl,
        mediaSummary: buildMediaSummary(result.probe, {
          name: result.name,
          size: result.blob.size,
        }),
        appliedGainDb: gainDb,
        appliedBassEqDb: bassEqDb,
        appliedVirtualBassDb: virtualBassDb,
        outputAnalysis: result.outputAnalysis,
        warnings,
      })
      setPhase('ready')
      triggerFileDownload(exportUrl, result.name)
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

    setCurrentTime(element.currentTime)
    setDuration(Number.isFinite(element.duration) ? element.duration : 0)
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
    setCurrentTime(nextTime)
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  const handleVideoEnded = () => {
    const element = videoRef.current
    setIsPlaying(false)
    setCurrentTime(element ? element.duration : 0)
  }

  const handleVideoTimeUpdate = () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    setCurrentTime(element.currentTime)
  }

  return {
    activeVideoSrc,
    baseAnalysis,
    bassEqDb,
    bassEqHighHz,
    bassEqLowHz,
    blockingIssue,
    canAdjustVolume,
    currentTime,
    derivedAnalysis,
    duration,
    exportAsset,
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
    handleVideoTimeUpdate,
    handleVirtualBassChange,
    handleVirtualBassCutoffChange,
    isPlaying,
    mediaSummary,
    phase,
    playbackSupport,
    previewMode,
    selectedFile,
    videoRef,
    virtualBassCutoffHz,
    virtualBassDb,
  }
}

function triggerFileDownload(url: string, fileName: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
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

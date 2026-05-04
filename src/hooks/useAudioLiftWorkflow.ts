import { startTransition, useEffect, useRef, useState } from 'react'
import {
  COMPARISON_LOOP_SECONDS,
  DEFAULT_GAIN_DB,
  PREVIEW_SECONDS,
} from '../lib/constants'
import { browserMediaEngine } from '../lib/ffmpeg'
import {
  assessBrowserPlaybackSupport,
  buildDerivedAnalysis,
  buildMediaSummary,
  getBlockingIssue,
  getFeedbackMessages,
  validateSelectedFile,
} from '../lib/validation'
import type {
  AudioAnalysis,
  BrowserPlaybackSupport,
  GeneratedAsset,
  MediaSummary,
  PreviewMode,
  ProcessingPhase,
  ValidationIssue,
} from '../types'

export function useAudioLiftWorkflow() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const requestIdRef = useRef(0)
  const pendingSeekRef = useRef(0)
  const wasPlayingBeforeSwitchRef = useRef(false)

  const [phase, setPhase] = useState<ProcessingPhase>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  const [mediaSummary, setMediaSummary] = useState<MediaSummary | null>(null)
  const [baseAnalysis, setBaseAnalysis] = useState<AudioAnalysis | null>(null)
  const [playbackSupport, setPlaybackSupport] =
    useState<BrowserPlaybackSupport | null>(null)
  const [gainDb, setGainDb] = useState(DEFAULT_GAIN_DB)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('original')
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null)
  const [exportAsset, setExportAsset] = useState<GeneratedAsset | null>(null)
  const [blockingIssue, setBlockingIssue] = useState<ValidationIssue | null>(null)
  const [comparisonLoopEnabled, setComparisonLoopEnabled] = useState(false)
  const [comparisonStartTime, setComparisonStartTime] = useState(0)

  useEffect(() => {
    return () => {
      if (selectedFileUrl) {
        URL.revokeObjectURL(selectedFileUrl)
      }
    }
  }, [selectedFileUrl])

  useEffect(() => {
    return () => {
      if (previewAsset) {
        URL.revokeObjectURL(previewAsset.url)
      }
    }
  }, [previewAsset])

  useEffect(() => {
    return () => {
      if (exportAsset) {
        URL.revokeObjectURL(exportAsset.url)
      }
    }
  }, [exportAsset])

  useEffect(() => {
    setPreviewMode('original')
    setComparisonLoopEnabled(false)
    setComparisonStartTime(0)
    pendingSeekRef.current = 0
    wasPlayingBeforeSwitchRef.current = false

    if (previewAsset) {
      URL.revokeObjectURL(previewAsset.url)
      setPreviewAsset(null)
    }

    if (exportAsset) {
      URL.revokeObjectURL(exportAsset.url)
      setExportAsset(null)
    }
  }, [gainDb])

  const derivedAnalysis = baseAnalysis
    ? buildDerivedAnalysis(baseAnalysis, gainDb)
    : null
  const canAdjustVolume = Boolean(baseAnalysis && derivedAnalysis)
  const feedbackMessages = getFeedbackMessages(baseAnalysis, derivedAnalysis)
  const activeVideoSrc =
    previewMode === 'adjusted' && previewAsset ? previewAsset.url : selectedFileUrl
  const listeningModeLabel =
    previewMode === 'adjusted' ? 'Processed Output' : 'Original Signal'

  const capturePlaybackContext = (fallbackTime = 0) => {
    const element = videoRef.current
    const time = clampPlaybackTime(
      element?.currentTime ?? fallbackTime,
      getComparableDuration(element),
    )

    pendingSeekRef.current = time
    wasPlayingBeforeSwitchRef.current = Boolean(
      element && !element.paused && !element.ended,
    )

    return time
  }

  const resetForNewSelection = () => {
    setMediaSummary(null)
    setBaseAnalysis(null)
    setPlaybackSupport(null)
    setBlockingIssue(null)
    setPhase('idle')
    setPreviewMode('original')
    setComparisonLoopEnabled(false)
    setComparisonStartTime(0)
    pendingSeekRef.current = 0
    wasPlayingBeforeSwitchRef.current = false

    if (previewAsset) {
      URL.revokeObjectURL(previewAsset.url)
      setPreviewAsset(null)
    }

    if (exportAsset) {
      URL.revokeObjectURL(exportAsset.url)
      setExportAsset(null)
    }
  }

  const handleFileSelection = async (file: File) => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl)
    }

    const localUrl = URL.createObjectURL(file)

    startTransition(() => {
      setSelectedFile(file)
      setSelectedFileUrl(localUrl)
      setGainDb(DEFAULT_GAIN_DB)
      resetForNewSelection()
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
    } finally {
      // Cleanup if needed
    }
  }

  const handleGeneratePreview = async () => {
    if (!selectedFile || !derivedAnalysis || !mediaSummary) {
      return
    }

    setPhase('previewing')

    try {
      const result = await browserMediaEngine.createPreview(
        selectedFile,
        derivedAnalysis.gainDb,
        () => {},
      )

      if (previewAsset) {
        URL.revokeObjectURL(previewAsset.url)
      }

      const previewUrl = URL.createObjectURL(result.blob)
      const anchorTime = capturePlaybackContext()

      setPreviewAsset({
        name: result.name,
        sizeBytes: result.blob.size,
        url: previewUrl,
        mediaSummary: buildMediaSummary(result.probe, {
          name: result.name,
          size: result.blob.size,
        }),
      })
      setComparisonStartTime(anchorTime)
      setPreviewMode('adjusted')
      setPhase('ready')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error creating preview'

      setPhase('error')
      setBlockingIssue({
        code: 'preview-failed',
        message,
        canRecover: true,
      })
    } finally {
      // Cleanup
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
        derivedAnalysis.gainDb,
        () => {},
      )

      if (exportAsset) {
        URL.revokeObjectURL(exportAsset.url)
      }

      const exportUrl = URL.createObjectURL(result.blob)

      setExportAsset({
        name: result.name,
        sizeBytes: result.blob.size,
        url: exportUrl,
        mediaSummary: buildMediaSummary(result.probe, {
          name: result.name,
          size: result.blob.size,
        }),
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
    } finally {
      // Cleanup
    }
  }

  const handlePreviewModeChange = (mode: PreviewMode) => {
    if (mode === 'adjusted' && !previewAsset) {
      return
    }

    const anchorTime = capturePlaybackContext()
    setComparisonStartTime(anchorTime)
    setPreviewMode(mode)
  }

  const handleReplayComparison = () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    const comparableDuration = getComparableDuration(element)
    const replayStart = comparisonLoopEnabled
      ? comparisonStartTime
      : Math.max(0, element.currentTime - COMPARISON_LOOP_SECONDS)
    const boundedStart = clampPlaybackTime(replayStart, comparableDuration)

    setComparisonStartTime(boundedStart)
    pendingSeekRef.current = boundedStart
    element.currentTime = boundedStart
    void element.play().catch(() => undefined)
  }

  const handleToggleComparisonLoop = () => {
    const nextEnabled = !comparisonLoopEnabled

    if (nextEnabled) {
      const element = videoRef.current
      const comparableDuration = getComparableDuration(element)
      const anchorTime = clampPlaybackTime(
        element?.currentTime ?? pendingSeekRef.current,
        comparableDuration,
      )

      setComparisonStartTime(anchorTime)
      pendingSeekRef.current = anchorTime
    }

    setComparisonLoopEnabled(nextEnabled)
  }

  const handleVideoLoadedMetadata = () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    const targetTime = clampPlaybackTime(
      pendingSeekRef.current,
      getComparableDuration(element),
    )

    if (targetTime > 0) {
      element.currentTime = targetTime
    }

    if (wasPlayingBeforeSwitchRef.current) {
      wasPlayingBeforeSwitchRef.current = false
      void element.play().catch(() => undefined)
    }
  }

  const handleVideoTimeUpdate = () => {
    const element = videoRef.current
    if (!element) {
      return
    }

    if (comparisonLoopEnabled) {
      const comparableDuration = getComparableDuration(element)
      const loopEnd = Math.min(
        comparisonStartTime + COMPARISON_LOOP_SECONDS,
        comparableDuration,
      )

      if (element.currentTime >= loopEnd) {
        element.currentTime = comparisonStartTime
        void element.play().catch(() => undefined)
      }
      return
    }

    if (previewMode !== 'original') {
      return
    }

    if (element.currentTime >= PREVIEW_SECONDS) {
      element.currentTime = 0
      void element.play().catch(() => undefined)
    }
  }

  return {
    activeVideoSrc,
    baseAnalysis,
    blockingIssue,
    canAdjustVolume,
    derivedAnalysis,
    exportAsset,
    feedbackMessages,
    gainDb,
    comparisonLoopEnabled,
    handleExport,
    handleFileSelection,
    handleGeneratePreview,
    handlePreviewModeChange,
    handleReplayComparison,
    handleToggleComparisonLoop,
    handleVideoLoadedMetadata,
    handleVideoTimeUpdate,
    listeningModeLabel,
    mediaSummary,
    phase,
    playbackSupport,
    previewAsset,
    previewMode,
    selectedFile,
    setGainDb,
    videoRef,
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

function getComparableDuration(element: HTMLVideoElement | null) {
  const duration = Number.isFinite(element?.duration) ? element?.duration ?? 0 : 0
  return Math.min(duration || PREVIEW_SECONDS, PREVIEW_SECONDS)
}

function clampPlaybackTime(time: number, duration: number) {
  if (!Number.isFinite(time) || time <= 0) {
    return 0
  }

  return Math.min(time, Math.max(duration - 0.05, 0))
}

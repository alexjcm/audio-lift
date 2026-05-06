import { startTransition, useEffect, useRef, useState } from 'react'
import { DEFAULT_GAIN_DB } from '../lib/constants'
import { browserMediaEngine } from '../lib/ffmpeg'
import { LivePreviewEngine } from '../lib/livePreview'
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
  const [previewMode, setPreviewMode] = useState<PreviewMode>('original')
  const [exportAsset, setExportAsset] = useState<GeneratedAsset | null>(null)
  const [blockingIssue, setBlockingIssue] = useState<ValidationIssue | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    livePreview.setGainDb(gainDb)
  }, [gainDb])

  useEffect(() => {
    livePreview.setMode(previewMode)
  }, [previewMode])

  useEffect(() => {
    return () => {
      revokeObjectUrl(selectedFileUrlRef.current)
      revokeObjectUrl(exportAssetRef.current?.url ?? null)
      livePreview.detach()
    }
  }, [])

  const derivedAnalysis = baseAnalysis
    ? buildDerivedAnalysis(baseAnalysis, gainDb)
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
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    replaceExportAsset(null)
    livePreview.detach()
  }

  const handleGainChange = (value: number) => {
    if (value === gainDb) {
      return
    }

    setGainDb(value)
    setPreviewMode('original')
    replaceExportAsset(null)
  }

  const handleFileSelection = async (file: File) => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    const localUrl = URL.createObjectURL(file)

    startTransition(() => {
      resetForNewSelection()
      setSelectedFile(file)
      replaceSelectedFileUrl(localUrl)
      setGainDb(DEFAULT_GAIN_DB)
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
        derivedAnalysis.gainDb,
        () => {},
      )

      const exportUrl = URL.createObjectURL(result.blob)

      replaceExportAsset({
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
    blockingIssue,
    canAdjustVolume,
    derivedAnalysis,
    exportAsset,
    feedbackMessages,
    gainDb,
    handleExport,
    handleFileSelection,
    handlePlayPause,
    handleGainChange,
    handlePreviewModeChange,
    handleSeekChange,
    handleVideoEnded,
    handleVideoLoadedMetadata,
    handleVideoPause,
    handleVideoPlay,
    handleVideoTimeUpdate,
    currentTime,
    mediaSummary,
    duration,
    isPlaying,
    phase,
    playbackSupport,
    previewMode,
    selectedFile,
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

function revokeObjectUrl(url: string | null) {
  if (!url) {
    return
  }

  URL.revokeObjectURL(url)
}

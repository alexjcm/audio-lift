import type { PreviewMode } from '../types'

const GAIN_SMOOTHING_SECONDS = 0.02

export class LivePreviewEngine {
  private context: AudioContext | null = null
  private source: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private element: HTMLVideoElement | null = null
  private currentMode: PreviewMode = 'original'
  private currentGainDb = 0
  private resumeHandler: (() => void) | null = null

  attach(element: HTMLVideoElement) {
    if (this.element === element && this.source && this.gainNode) {
      this.applyCurrentGain()
      return
    }

    this.detach()

    const context = new AudioContext()
    const source = context.createMediaElementSource(element)
    const gainNode = new GainNode(context, { gain: 1 })

    source.connect(gainNode)
    gainNode.connect(context.destination)

    const resumeHandler = () => {
      void context.resume().catch(() => undefined)
    }

    element.addEventListener('play', resumeHandler)

    this.context = context
    this.source = source
    this.gainNode = gainNode
    this.element = element
    this.resumeHandler = resumeHandler
    this.applyCurrentGain()
  }

  detach() {
    if (this.element && this.resumeHandler) {
      this.element.removeEventListener('play', this.resumeHandler)
    }

    this.resumeHandler = null

    try {
      this.source?.disconnect()
    } catch {
      // no-op
    }

    try {
      this.gainNode?.disconnect()
    } catch {
      // no-op
    }

    void this.context?.close().catch(() => undefined)

    this.context = null
    this.source = null
    this.gainNode = null
    this.element = null
  }

  setGainDb(gainDb: number) {
    this.currentGainDb = gainDb
    this.applyCurrentGain()
  }

  setMode(mode: PreviewMode) {
    this.currentMode = mode
    this.applyCurrentGain()
  }

  private applyCurrentGain() {
    if (!this.context || !this.gainNode) {
      return
    }

    const targetValue =
      this.currentMode === 'adjusted' ? dbToLinearGain(this.currentGainDb) : 1

    const now = this.context.currentTime
    const parameter = this.gainNode.gain

    parameter.cancelScheduledValues(now)
    parameter.setTargetAtTime(targetValue, now, GAIN_SMOOTHING_SECONDS)
  }
}

function dbToLinearGain(gainDb: number) {
  return 10 ** (gainDb / 20)
}

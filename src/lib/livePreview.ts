import {
  BASS_EQ_FREQ_HIGH_HZ,
  BASS_EQ_FREQ_LOW_HZ,
  VIRTUAL_BASS_CUTOFF_HZ,
  DEFAULT_VIRTUAL_BASS_DRIVE,
  VIRTUAL_BASS_HARMONIC_HP_HZ,
  VIRTUAL_BASS_HARMONIC_LP_HZ,
} from './constants'
import {
  deriveBassEqCenterHz,
  deriveBassEqQ,
  mapDbToLinearGain,
  mapVirtualBassDbToMixGain,
} from './virtualBass'
import type { PreviewMode } from '../types'

const GAIN_SMOOTHING_SECONDS = 0.02
const VIRTUAL_BASS_DISCONNECT_DELAY_MS = 160

export class LivePreviewEngine {
  private context: AudioContext | null = null
  private source: MediaElementAudioSourceNode | null = null
  private peakingNode: BiquadFilterNode | null = null
  private masterGainNode: GainNode | null = null
  private vbInputLowpassNode: BiquadFilterNode | null = null
  private vbSplitterNode: ChannelSplitterNode | null = null
  private vbLeftGainNode: GainNode | null = null
  private vbRightGainNode: GainNode | null = null
  private vbMonoSumNode: GainNode | null = null
  private vbShaperNode: WaveShaperNode | null = null
  private vbHighpassNode: BiquadFilterNode | null = null
  private vbLowpassNode: BiquadFilterNode | null = null
  private vbMixGainNode: GainNode | null = null
  private element: HTMLVideoElement | null = null
  private currentMode: PreviewMode = 'original'
  private currentGainDb = 0
  private currentBassEqDb = 0
  private currentBassEqLowHz = BASS_EQ_FREQ_LOW_HZ
  private currentBassEqHighHz = BASS_EQ_FREQ_HIGH_HZ
  private currentVirtualBassDb = 0
  private currentVirtualBassCutoffHz = VIRTUAL_BASS_CUTOFF_HZ
  private currentVirtualBassDrive = DEFAULT_VIRTUAL_BASS_DRIVE
  private vbBranchConnected = false
  private vbDisconnectTimer: number | null = null
  private resumeHandler: (() => void) | null = null

  attach(element: HTMLVideoElement) {
    if (this.element === element && this.source && this.masterGainNode) {
      this.applyCurrentState()
      return
    }

    this.detach()

    const context = this.context ?? new AudioContext()
    const source = context.createMediaElementSource(element)
    const peakingNode = context.createBiquadFilter()
    peakingNode.type = 'peaking'

    const masterGainNode = new GainNode(context, { gain: 1 })

    const vbInputLowpassNode = context.createBiquadFilter()
    vbInputLowpassNode.type = 'lowpass'

    const vbSplitterNode = context.createChannelSplitter(2)
    const vbLeftGainNode = new GainNode(context, { gain: 0.5 })
    const vbRightGainNode = new GainNode(context, { gain: 0.5 })
    const vbMonoSumNode = new GainNode(context, { gain: 1 })
    vbMonoSumNode.channelCount = 1
    vbMonoSumNode.channelCountMode = 'explicit'

    const vbShaperNode = context.createWaveShaper()
    vbShaperNode.curve = createTanhCurve(this.currentVirtualBassDrive)
    vbShaperNode.oversample = '4x'

    const vbHighpassNode = context.createBiquadFilter()
    vbHighpassNode.type = 'highpass'

    const vbLowpassNode = context.createBiquadFilter()
    vbLowpassNode.type = 'lowpass'

    const vbMixGainNode = new GainNode(context, { gain: 0 })

    source.connect(peakingNode)
    peakingNode.connect(masterGainNode)

    vbInputLowpassNode.connect(vbSplitterNode)
    vbSplitterNode.connect(vbLeftGainNode, 0)
    vbSplitterNode.connect(vbRightGainNode, 1)
    vbLeftGainNode.connect(vbMonoSumNode)
    vbRightGainNode.connect(vbMonoSumNode)
    vbMonoSumNode.connect(vbShaperNode)
    vbShaperNode.connect(vbHighpassNode)
    vbHighpassNode.connect(vbLowpassNode)
    vbLowpassNode.connect(vbMixGainNode)
    vbMixGainNode.connect(masterGainNode)

    masterGainNode.connect(context.destination)

    const resumeHandler = () => {
      void context.resume().catch(() => undefined)
    }

    element.addEventListener('play', resumeHandler)

    this.context = context
    this.source = source
    this.peakingNode = peakingNode
    this.masterGainNode = masterGainNode
    this.vbInputLowpassNode = vbInputLowpassNode
    this.vbSplitterNode = vbSplitterNode
    this.vbLeftGainNode = vbLeftGainNode
    this.vbRightGainNode = vbRightGainNode
    this.vbMonoSumNode = vbMonoSumNode
    this.vbShaperNode = vbShaperNode
    this.vbHighpassNode = vbHighpassNode
    this.vbLowpassNode = vbLowpassNode
    this.vbMixGainNode = vbMixGainNode
    this.vbBranchConnected = false
    this.element = element
    this.resumeHandler = resumeHandler
    this.applyCurrentState()
  }

  detach() {
    this.clearVirtualBassDisconnectTimer()
    this.disconnectVirtualBassBranch()

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
      this.peakingNode?.disconnect()
    } catch {
      // no-op
    }

    try {
      this.masterGainNode?.disconnect()
    } catch {
      // no-op
    }

    try {
      this.vbInputLowpassNode?.disconnect()
      this.vbSplitterNode?.disconnect()
      this.vbLeftGainNode?.disconnect()
      this.vbRightGainNode?.disconnect()
      this.vbMonoSumNode?.disconnect()
      this.vbShaperNode?.disconnect()
      this.vbHighpassNode?.disconnect()
      this.vbLowpassNode?.disconnect()
      this.vbMixGainNode?.disconnect()
    } catch {
      // no-op
    }
    this.source = null
    this.peakingNode = null
    this.masterGainNode = null
    this.vbInputLowpassNode = null
    this.vbSplitterNode = null
    this.vbLeftGainNode = null
    this.vbRightGainNode = null
    this.vbMonoSumNode = null
    this.vbShaperNode = null
    this.vbHighpassNode = null
    this.vbLowpassNode = null
    this.vbMixGainNode = null
    this.vbBranchConnected = false
    this.element = null
  }

  destroy() {
    this.detach()

    const context = this.context
    this.context = null

    void context?.close().catch(() => undefined)
  }

  setGainDb(gainDb: number) {
    this.currentGainDb = gainDb
    this.applyCurrentState()
  }

  setBassEqDb(bassEqDb: number) {
    this.currentBassEqDb = bassEqDb
    this.applyCurrentState()
  }

  setBassEqRange(lowHz: number, highHz: number) {
    this.currentBassEqLowHz = lowHz
    this.currentBassEqHighHz = highHz
    this.applyCurrentState()
  }

  setVirtualBassDb(virtualBassDb: number) {
    this.currentVirtualBassDb = virtualBassDb
    this.applyCurrentState()
  }

  setVirtualBassCutoffHz(cutoffHz: number) {
    this.currentVirtualBassCutoffHz = cutoffHz
    this.applyCurrentState()
  }

  setVirtualBassDrive(drive: number) {
    if (this.currentVirtualBassDrive === drive) {
      return
    }
    this.currentVirtualBassDrive = drive
    if (this.vbShaperNode) {
      this.vbShaperNode.curve = createTanhCurve(drive)
    }
  }

  setMode(mode: PreviewMode) {
    this.currentMode = mode
    this.applyCurrentState()
  }

  private applyCurrentState() {
    if (
      !this.context ||
      !this.masterGainNode ||
      !this.peakingNode ||
      !this.vbInputLowpassNode ||
      !this.vbHighpassNode ||
      !this.vbLowpassNode ||
      !this.vbMixGainNode
    ) {
      return
    }

    const now = this.context.currentTime
    const masterGainValue =
      this.currentMode === 'adjusted' ? mapDbToLinearGain(this.currentGainDb) : 1
    const peakingGainValue =
      this.currentMode === 'adjusted' ? this.currentBassEqDb : 0
    const virtualBassMixValue =
      this.currentMode === 'adjusted'
        ? mapVirtualBassDbToMixGain(this.currentVirtualBassDb)
        : 0
    const shouldVirtualBassProcess = virtualBassMixValue > 0

    if (shouldVirtualBassProcess) {
      this.connectVirtualBassBranch()
    }

    this.masterGainNode.gain.cancelScheduledValues(now)
    this.masterGainNode.gain.setTargetAtTime(
      masterGainValue,
      now,
      GAIN_SMOOTHING_SECONDS,
    )

    this.peakingNode.gain.cancelScheduledValues(now)
    this.peakingNode.gain.setTargetAtTime(
      peakingGainValue,
      now,
      GAIN_SMOOTHING_SECONDS,
    )

    const centerHz = deriveBassEqCenterHz(
      this.currentBassEqLowHz,
      this.currentBassEqHighHz,
    )
    const q = deriveBassEqQ(this.currentBassEqLowHz, this.currentBassEqHighHz)
    this.peakingNode.frequency.cancelScheduledValues(now)
    this.peakingNode.frequency.setTargetAtTime(
      centerHz,
      now,
      GAIN_SMOOTHING_SECONDS,
    )
    this.peakingNode.Q.cancelScheduledValues(now)
    this.peakingNode.Q.setTargetAtTime(q, now, GAIN_SMOOTHING_SECONDS)

    this.vbInputLowpassNode.frequency.cancelScheduledValues(now)
    this.vbInputLowpassNode.frequency.setTargetAtTime(
      this.currentVirtualBassCutoffHz,
      now,
      GAIN_SMOOTHING_SECONDS,
    )

    this.vbHighpassNode.frequency.cancelScheduledValues(now)
    this.vbHighpassNode.frequency.setTargetAtTime(
      Math.max(this.currentVirtualBassCutoffHz, VIRTUAL_BASS_HARMONIC_HP_HZ),
      now,
      GAIN_SMOOTHING_SECONDS,
    )

    this.vbLowpassNode.frequency.cancelScheduledValues(now)
    this.vbLowpassNode.frequency.setTargetAtTime(
      VIRTUAL_BASS_HARMONIC_LP_HZ,
      now,
      GAIN_SMOOTHING_SECONDS,
    )

    this.vbMixGainNode.gain.cancelScheduledValues(now)
    this.vbMixGainNode.gain.setTargetAtTime(
      virtualBassMixValue,
      now,
      GAIN_SMOOTHING_SECONDS,
    )

    if (!shouldVirtualBassProcess) {
      this.scheduleVirtualBassDisconnect()
    }
  }

  private connectVirtualBassBranch() {
    this.clearVirtualBassDisconnectTimer()

    if (!this.source || !this.vbInputLowpassNode || this.vbBranchConnected) {
      return
    }

    this.source.connect(this.vbInputLowpassNode)
    this.vbBranchConnected = true
  }

  private disconnectVirtualBassBranch() {
    this.clearVirtualBassDisconnectTimer()

    if (!this.source || !this.vbInputLowpassNode || !this.vbBranchConnected) {
      return
    }

    try {
      this.source.disconnect(this.vbInputLowpassNode)
    } catch {
      // no-op
    }

    this.vbBranchConnected = false
  }

  private scheduleVirtualBassDisconnect() {
    if (!this.vbBranchConnected || this.vbDisconnectTimer !== null) {
      return
    }

    this.vbDisconnectTimer = window.setTimeout(() => {
      this.disconnectVirtualBassBranch()
    }, VIRTUAL_BASS_DISCONNECT_DELAY_MS)
  }

  private clearVirtualBassDisconnectTimer() {
    if (this.vbDisconnectTimer === null) {
      return
    }

    window.clearTimeout(this.vbDisconnectTimer)
    this.vbDisconnectTimer = null
  }
}

function createTanhCurve(drive: number) {
  const sampleCount = 4096
  const curve = new Float32Array(sampleCount)

  for (let index = 0; index < sampleCount; index += 1) {
    const x = (index / (sampleCount - 1)) * 2 - 1
    curve[index] = Math.tanh(drive * x)
  }

  return curve
}

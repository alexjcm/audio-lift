import { useEffect } from 'react'
import type { LivePreviewEngine } from '../lib/livePreview'
import type { PreviewMode } from '../types'

type SyncParams = {
  gainDb: number
  bassEqDb: number
  bassEqLowHz: number
  bassEqHighHz: number
  virtualBassDb: number
  virtualBassCutoffHz: number
  virtualBassDrive: number
  previewMode: PreviewMode
}

export function useLivePreviewSync(
  livePreview: LivePreviewEngine,
  {
    gainDb,
    bassEqDb,
    bassEqLowHz,
    bassEqHighHz,
    virtualBassDb,
    virtualBassCutoffHz,
    virtualBassDrive,
    previewMode,
  }: SyncParams,
) {
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
    livePreview.setVirtualBassDrive(virtualBassDrive)
  }, [virtualBassDrive, livePreview])

  useEffect(() => {
    livePreview.setMode(previewMode)
  }, [previewMode, livePreview])
}

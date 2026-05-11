import { useState, useEffect } from 'react'
import { SETTINGS_STORAGE_KEY } from '../lib/constants'
import {
  clampBassEqHighHz,
  clampBassEqLowHz,
  clampVirtualBassCutoffHz,
  getDefaultGlobalSettings,
  normalizeGlobalSettings,
} from '../lib/virtualBass'
import type { GlobalSettings } from '../types'

const SETTINGS_PERSIST_DELAY_MS = 180

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

export function useGlobalSettings() {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() =>
    loadGlobalSettings(),
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      persistGlobalSettings(globalSettings)
    }, SETTINGS_PERSIST_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [globalSettings])

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

  const handleTargetTruePeakChange = (value: number) => {
    setGlobalSettings((current) => normalizeGlobalSettings({
      ...current,
      targetTruePeakDbtp: value,
    }))
  }

  const handleVirtualBassDriveChange = (value: number) => {
    setGlobalSettings((current) => normalizeGlobalSettings({
      ...current,
      virtualBassDrive: value,
    }))
  }

  const handleResetGlobalSettings = () => {
    setGlobalSettings(getDefaultGlobalSettings())
  }

  return {
    globalSettings,
    handleBassEqLowChange,
    handleBassEqHighChange,
    handleVirtualBassCutoffChange,
    handleTargetTruePeakChange,
    handleVirtualBassDriveChange,
    handleResetGlobalSettings,
  }
}

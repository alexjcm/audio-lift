import {
  BASS_EQ_FREQ_HIGH_HZ,
  BASS_EQ_FREQ_LOW_HZ,
  BASS_EQ_FREQ_MAX_HZ,
  BASS_EQ_FREQ_MIN_HZ,
  VIRTUAL_BASS_CUTOFF_HZ,
  VIRTUAL_BASS_CUTOFF_MAX_HZ,
  VIRTUAL_BASS_CUTOFF_MIN_HZ,
} from './constants'
import type { GlobalSettings } from '../types'

export const TRUE_PEAK_TARGET_DBTP = -1
export const TRUE_PEAK_LIMIT_LINEAR = mapDbToLinearGain(TRUE_PEAK_TARGET_DBTP)

export function mapDbToLinearGain(db: number) {
  return 10 ** (db / 20)
}

export function mapVirtualBassDbToMixGain(db: number) {
  if (db <= 0) {
    return 0
  }

  return Math.max(0, mapDbToLinearGain(db) - 1)
}

export function clampBassEqLowHz(value: number, currentHighHz: number) {
  return clampFrequency(value, BASS_EQ_FREQ_MIN_HZ, Math.max(BASS_EQ_FREQ_MIN_HZ, currentHighHz - 1))
}

export function clampBassEqHighHz(value: number, currentLowHz: number) {
  return clampFrequency(value, Math.min(BASS_EQ_FREQ_MAX_HZ, currentLowHz + 1), BASS_EQ_FREQ_MAX_HZ)
}

export function clampVirtualBassCutoffHz(value: number) {
  return clampFrequency(value, VIRTUAL_BASS_CUTOFF_MIN_HZ, VIRTUAL_BASS_CUTOFF_MAX_HZ)
}

export function deriveBassEqCenterHz(lowHz: number, highHz: number) {
  const safeLowHz = Math.max(BASS_EQ_FREQ_MIN_HZ, Math.min(lowHz, highHz - 1))
  const safeHighHz = Math.max(safeLowHz + 1, Math.min(highHz, BASS_EQ_FREQ_MAX_HZ))
  return Math.sqrt(safeLowHz * safeHighHz)
}

export function deriveBassEqQ(lowHz: number, highHz: number) {
  const safeLowHz = Math.max(BASS_EQ_FREQ_MIN_HZ, Math.min(lowHz, highHz - 1))
  const safeHighHz = Math.max(safeLowHz + 1, Math.min(highHz, BASS_EQ_FREQ_MAX_HZ))
  const bandwidthRatio = safeHighHz / safeLowHz
  const q = Math.sqrt(bandwidthRatio) / (bandwidthRatio - 1)

  return clampNumber(Number.isFinite(q) ? q : 1, 0.1, 10)
}

export function getDefaultGlobalSettings(): GlobalSettings {
  return {
    bassEqLowHz: BASS_EQ_FREQ_LOW_HZ,
    bassEqHighHz: BASS_EQ_FREQ_HIGH_HZ,
    virtualBassCutoffHz: VIRTUAL_BASS_CUTOFF_HZ,
  }
}

export function normalizeGlobalSettings(
  partial: Partial<GlobalSettings> | null | undefined,
) {
  const defaults = getDefaultGlobalSettings()
  const bassEqHighHz = clampBassEqHighHz(
    partial?.bassEqHighHz ?? defaults.bassEqHighHz,
    clampBassEqLowHz(partial?.bassEqLowHz ?? defaults.bassEqLowHz, partial?.bassEqHighHz ?? defaults.bassEqHighHz),
  )
  const bassEqLowHz = clampBassEqLowHz(
    partial?.bassEqLowHz ?? defaults.bassEqLowHz,
    bassEqHighHz,
  )

  return {
    bassEqLowHz,
    bassEqHighHz,
    virtualBassCutoffHz: clampVirtualBassCutoffHz(
      partial?.virtualBassCutoffHz ?? defaults.virtualBassCutoffHz,
    ),
  } satisfies GlobalSettings
}

function clampFrequency(value: number, min: number, max: number) {
  return Math.round(clampNumber(value, min, max))
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

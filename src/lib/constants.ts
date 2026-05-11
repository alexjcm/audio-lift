export const MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024
export const MAX_DURATION_SECONDS = 180

export const GAIN_MIN_DB = 0
export const GAIN_MAX_DB = 10
export const GAIN_STEP_DB = 0.1
export const DEFAULT_GAIN_DB = 0

export const BASS_EQ_MIN_DB = 0
export const BASS_EQ_MAX_DB = 12
export const BASS_EQ_STEP_DB = 0.1
export const DEFAULT_BASS_EQ_DB = 0

export const BASS_EQ_FREQ_LOW_HZ = 150
export const BASS_EQ_FREQ_HIGH_HZ = 300
export const BASS_EQ_FREQ_MIN_HZ = 20
export const BASS_EQ_FREQ_MAX_HZ = 300

export const VIRTUAL_BASS_MIN_DB = 0
export const VIRTUAL_BASS_MAX_DB = 12
export const VIRTUAL_BASS_STEP_DB = 0.1
export const DEFAULT_VIRTUAL_BASS_DB = 0

export const VIRTUAL_BASS_CUTOFF_HZ = 150
export const VIRTUAL_BASS_CUTOFF_MIN_HZ = 20
export const VIRTUAL_BASS_CUTOFF_MAX_HZ = 250
export const VIRTUAL_BASS_HARMONIC_HP_HZ = 150
export const VIRTUAL_BASS_HARMONIC_LP_HZ = 900
export const VIRTUAL_BASS_DRIVE_MIN = 1
export const VIRTUAL_BASS_DRIVE_MAX = 6
export const DEFAULT_VIRTUAL_BASS_DRIVE = 3

export const TARGET_TRUE_PEAK_DEFAULT = -1.0
export const TARGET_TRUE_PEAK_MAX = -0.1

export const SETTINGS_STORAGE_KEY = 'audio-lift:global-settings:v1'

export const SUPPORTED_EXTENSIONS = new Set(['mp4', 'mov'])
export const SUPPORTED_VIDEO_CODECS = new Set(['H.264', 'HEVC'])

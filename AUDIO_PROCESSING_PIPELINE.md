# Audio Processing Pipeline

This document summarizes the real audio-processing flow used by the app for `Preview` and `Export`.

- `Bass EQ` and `Virtual Bass` are separate and independent techniques.
- `Gain` is the final master-level control.
- `Virtual Bass` is optional and only processes when it is active.
- Export uses a final protection stage to control true peak before encoding.
- True-peak oversampling follows a `4x` strategy based on the input sample rate.
  Common cases in this app are:
  - `44.1 kHz -> 176.4 kHz`
  - `48 kHz -> 192 kHz`

## Preview

Preview runs in real time through Web Audio.

- `Bass EQ` shapes the low-end on the main path.
- `Master Gain` applies the final preview level.
- `Virtual Bass` runs as a parallel branch and is mixed back into the master path.
- The final output is a single monitored signal.

```text
PREVIEW
Source
 -> Bass EQ
 -> Master Gain -----------------> Output

Source
 -> optional Virtual Bass branch
 -> Mix into Master Gain --------> Output
```

## Export

Export runs through FFmpeg and produces the final rendered file.

- If `Virtual Bass` is active, it is generated in a parallel branch and mixed with the dry signal first.
- `Bass EQ` is applied before final gain staging.
- `Gain` applies the requested master-level increase.
- `True-peak oversample (4x input sample rate)` gives the limiter a safer working stage.
- Typical export cases are `44.1 kHz -> 176.4 kHz` and `48 kHz -> 192 kHz`.
- `Limiter` controls final peak behavior before encoding.
- `Resample to output sample rate` returns the signal to the target sample rate.
- `AAC encode` writes the processed audio track into the exported video.

```text
EXPORT
Input
 -> optional Virtual Bass branch + mix
 -> Bass EQ
 -> Gain
 -> True-peak oversample (4x input sample rate)
 -> Limiter
 -> Resample to output sample rate
 -> AAC encode
```

## Functional Interpretation

- `Virtual Bass` adds perceived bass through harmonic generation, which is useful on small speakers.
- The limiter is the final protection stage before the audio is encoded into the output file.

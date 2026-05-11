# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## [1.0.0] - 2026-05-11

### Added
- Initial public release of `Audio Lift`, a Progressive Web App for adjusting and boosting video audio directly in the browser.
- Audio gain increase for video files with local export that preserves the original video stream whenever technically feasible, avoiding unnecessary video quality loss.
- Sub-bass enhancement through an independent `Bass EQ` stage with adjustable low-end range control.
- Sub-bass enhancement through an independent `Virtual Bass` stage based on harmonic excitation, designed to make low frequencies feel stronger on limited speakers.
- Local media import, analysis, preview, and export workflow powered by `FFmpeg.wasm`, without uploading files to a server.
- Loudness (`LUFS`) and true peak (`dBTP`) analysis for more reliable audio adjustments and safer exports.
- Real-time preview tools to compare `Original Signal` and `Processed Output` while adjusting processing.
- Responsive mobile slider interactions for gain, bass, and settings controls.

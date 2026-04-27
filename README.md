# Audio Lift 🚀

**Audio Lift** is a high-performance Progressive Web App (PWA) designed to adjust and boost audio gain in video files directly within the browser.

Powered by **FFmpeg.wasm** and **WebAssembly**, Audio Lift processes your videos 100% locally, ensuring maximum privacy and speed without ever uploading files to a server.

## ✨ Key Features

- **Local Processing:** Everything happens on your device. Your videos never leave your browser.
- **Precision Analysis:** Accurate Loudness (LUFS) and True Peak measurement for professional-grade adjustments.
- **Smart Preview:** Generates a 6-second preview to validate audio adjustments before exporting the full file.
- **Video Preservation:** Adjusts audio without re-encoding the video (Stream Copy) whenever technically feasible, maintaining original quality and saving time.
- **Mobile Optimized:** Compact and fluid interface designed for fast workflows on mobile devices.
- **PWA Ready:** Install it on your device and use it like a native application.

## 🎵 Audio Standards

Audio Lift follows industry-standard metering to ensure broadcast-quality results:
- **Loudness (LUFS):** Measured using the **EBU R128** standard for consistent perceived volume.
- **True Peak (dBTP):** Analyzed to prevent digital clipping and ensure high-fidelity playback across all devices.

## 🎨 Design Philosophy

Audio Lift features a high-density, technical user interface inspired by **iZotope Ozone**. The aesthetic focuses on professional "Audio Rack" modularity:
- **Ozone-Inspired Palette:** A deep navy slate base with electric cyan and magenta highlights.
- **Technical Typography:** Uses **JetBrains Mono** for all signal metrics and technical data, mimicking professional DAW (Digital Audio Workstation) readouts.

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Media Engine:** FFmpeg.wasm (WebAssembly)
- Node.js v24+

## 🚀 Quick Start

### Installation

```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📦 Production Build

npm run build

## 📄 License

This project is open-source under the MIT License.

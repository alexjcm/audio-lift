# Audio Lift 🚀

**Audio Lift** is a high-performance Progressive Web App (PWA) designed to adjust and boost audio gain in video files directly within the browser.

Powered by **FFmpeg.wasm** and **WebAssembly**, Audio Lift processes your videos 100% locally, ensuring maximum privacy and speed without ever uploading files to a server.

## ✨ Key Features

- **Local Processing:** Everything happens on your device. Your videos never leave your browser.
- **Precision Analysis:** Accurate Loudness (LUFS) and True Peak measurement for professional-grade adjustments.
- **Live Preview:** Compare `Original Signal` and `Processed Output` instantly while moving the gain control in real time.
- **Video Preservation:** Adjusts audio without re-encoding the video (Stream Copy) whenever technically feasible, maintaining original quality and saving time.
- **Quality-First Export:** Final export is rendered with FFmpeg.wasm while preserving the original video stream whenever possible.
- **Export Clipping Alerts:** The app warns when the current gain setting would make the exported file cross `0 dBTP`.

## 🎵 Audio Standards

Audio Lift follows industry-standard metering to ensure broadcast-quality results:
- **Loudness (LUFS):** Measured using the **EBU R128** standard for consistent perceived volume.
- **True Peak (dBTP):** Measured using **ITU-R BS.1770** style true-peak analysis and used to estimate whether the exported file will clip.

## 🔁 Current Workflow

1. **Import Media** directly from the preview bar.
2. **Analyze** the file locally for codec, loudness, true peak, and audio metadata.
3. **Adjust Gain** with the live fader while listening to `Original Signal` or `Processed Output`.
4. **Export Master** to render the final file locally with FFmpeg.wasm.

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

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## ☁️ Cloudflare Pages

This project is ready to deploy to **Cloudflare Pages** as a static Vite application.

### Recommended project settings

- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** `24.14.0`

### Why Node is pinned

As of **May 5, 2026**, Cloudflare Pages' default v3 build image uses Node.js `22.16.0`. This repository pins Node with `.nvmrc` so the Pages build matches the local environment and does not rely on the dashboard default.

### Deploy option

1. Push this repository to GitHub or GitLab.
2. In Cloudflare, create a new **Pages** project from your Git repository.
3. Use the settings above.

### Notes for this app

- The app is fully static. It does not require Pages Functions.
- Cloudflare custom headers are defined in `public/_headers`.
- The FFmpeg WASM engine is runtime-cached instead of being forced into the initial precache, which keeps first install lighter on mobile networks while still allowing the engine to stay cached after first use.
- Cloudflare Pages has a hard single-file asset limit of `25 MiB`. Because `@ffmpeg/core` exceeds that limit, this app loads the FFmpeg core from a remote base URL at runtime instead of bundling the `.wasm` file into `dist/`.
- You can override the remote FFmpeg origin with `VITE_FFMPEG_CORE_BASE_URL` if you want to serve the core from your own CDN or R2 bucket.

## 📄 License

This project is open-source under the MIT License.

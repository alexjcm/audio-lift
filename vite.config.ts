import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'app-icon.svg',
        'app-icon-maskable.svg',
      ],
      manifest: {
        name: 'Audio Lift',
        short_name: 'Audio Lift',
        description:
          'Aumenta la ganancia del audio de videos cortos preservando el video original cuando el pipeline local lo permite.',
        theme_color: '#090910',
        background_color: '#090910',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/app-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/app-icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,wasm,webmanifest,png,ico}'],
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024,
      },
    }),
  ],
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
})

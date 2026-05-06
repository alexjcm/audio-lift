import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'Audio Lift',
        short_name: 'Audio Lift',
        description:
          'Increase video audio gain while preserving the original video stream whenever the local pipeline allows it.',
        theme_color: '#090910',
        background_color: '#090910',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,png,ico}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/worker-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ffmpeg-engine',
              cacheableResponse: {
                statuses: [200],
              },
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern:
              /^https:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core@.*\/dist\/esm\/ffmpeg-core\.(?:js|wasm)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ffmpeg-core-cdn',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
})

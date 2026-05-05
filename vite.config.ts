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
        'favicon.svg',
        'app-icon.svg',
        'app-icon-maskable.svg',
      ],
      manifest: {
        name: 'Audio Lift',
        short_name: 'Audio Lift',
        description:
          'Aumenta la ganancia del audio de videos preservando el video original cuando el pipeline local lo permite.',
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

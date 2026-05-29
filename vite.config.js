import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  server: {
    proxy: {
      // Forward /api/* from the Vite dev server (port 5173) to XAMPP (port 80)
      '/api': {
        target: 'http://localhost/8.1 - Module - U Festival App - 2026',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: '❤️U Festival 2026',
        short_name: '❤️U Festival',
        description: 'De officiële app voor het ❤️U Festival 2026 in Utrecht',
        start_url: './',
        scope: './',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#000000',
        theme_color: '#F03228',
        orientation: 'portrait',
        lang: 'nl',
        dir: 'ltr',
        categories: ['entertainment', 'lifestyle', 'social'],
        icons: [
          { src: './icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: './icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: './icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: 'Programma',
            short_name: 'Programma',
            description: 'Bekijk het festivalprogramma',
            url: './#/schedule',
            icons: [{ src: './icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Kaart',
            short_name: 'Kaart',
            description: 'Open de festivalkaart',
            url: './#/map',
            icons: [{ src: './icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Info',
            short_name: 'Info',
            description: 'Praktische informatie',
            url: './#/info',
            icons: [{ src: './icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheets (Material Icons)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            // Cache the actual font files served from gstatic
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ]
})

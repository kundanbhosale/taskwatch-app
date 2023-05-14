import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
  server: {
    host: true,
    port: 3001,
  },
  preview: {
    host: true,
    port: 3002,
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@db': path.resolve(__dirname, './src/db'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@svgs': path.resolve(__dirname, './src/svgs'),
      '@styled': path.resolve(__dirname, './src/styled'),
      '@typings': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@validations': path.resolve(__dirname, './src/validations'),
      '@features': path.resolve(__dirname, './src/features'),
      '@templates': path.resolve(__dirname, './src/templates'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // add this to cache all the imports
      workbox: {
        globPatterns: ['**/*'],
        offlineGoogleAnalytics: true,
      },
      // add this to cache all the
      // static assets in the public folder
      includeAssets: ['**/*'],
      manifest: {
        theme_color: '#711aff',
        background_color: '#fff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        name: 'Taskwatch - Kanban Board App',
        short_name: 'Task Watch',
        description:
          'Taskwatch is the ultimate Kanban board tool for personal project management. Stay organized and boost productivity with our offline-ready boards.',
        icons: [
          {
            src: '/icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any',
          },
        ],
      },
    }),
    {
      // default settings on build (i.e. fail on error)
      ...eslint(),
      apply: 'build',
    },
    {
      // do not fail on serve (i.e. local development)
      ...eslint({
        failOnWarning: false,
        failOnError: false,
      }),
      apply: 'serve',
      enforce: 'post',
    },
  ],
})

// "baseUrl": ".",
// "paths": {
//   "@components/*": ["src/components/*"],
//   "@db/*": ["src/db/*"],
//   "@pages/*": ["src/pages/*"],
//   "@utils/*": ["src/utils/*"],
//   "@svgs/*": ["src/svgs/*"],
//   "@styled/*": ["src/styled/*"],
//   "@typings/*": ["src/typings/*"],
//   "@contexts/*": ["src/contexts/*"],
//   "@hooks/*": ["src/hooks/*"]
// }

// vite.config.ts
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import { copyOnDev } from './vite-copy'
import { mockApiPlugin } from './vite-store-consent'

const envResult = dotenv.config({ path: '.env' })
dotenvExpand.expand(envResult)

export default defineConfig(({ mode }) => ({
  build: {
    terserOptions: {
      compress: { defaults: true, drop_console: true, drop_debugger: true, passes: 3 },
      format: { comments: false },
      ecma: 2020,
      module: true,
      toplevel: true,
    },
    copyPublicDir: false,
    rollupOptions: {
      input: [
        resolve(__dirname, 'src/js/consent.ts'),
        resolve(__dirname, 'src/images/logo.png'),
        resolve(__dirname, 'src/images/image-website.png'),
      ],
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'images/[name][extname]',
      },
    },
    outDir: 'dist',
  },

  // 👇 dit is de truc
  publicDir: 'public',
  root: 'public',

  server: {
    port: 5173,
    open: true,
    headers: { 'X-Country': 'ES' },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    mockApiPlugin(),
    copyOnDev({
      copies: [
        { from: './development/misc', to: './public' },
        { from: './src/images', to: './public/images' },
        { from: './development/data-sources', to: './public/banner' },
      ],
    }),
  ],
}))

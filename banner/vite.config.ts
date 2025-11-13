import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
// .env laden
const envResult = dotenv.config({
  path: '../.env',
});
dotenvExpand.expand(envResult);

export default defineConfig({
  build: {
    copyPublicDir: false,
    rollupOptions: {
      input: [
        resolve(__dirname, 'src/js/consent.ts'),
        resolve(__dirname, 'src/images/logo.png'),
        resolve(__dirname, 'src/images/image-website.png')
      ],
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'images/[name][extname]', // fallback, logo komt hier niet meer terecht
      },
    },
    outDir: 'dist',
  },
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
    headers: {
      'X-Country': 'ES',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

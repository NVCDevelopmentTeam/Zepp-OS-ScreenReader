import UnoCSS from 'unocss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { compression } from 'vite-plugin-compression2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
    sveltekit(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' })
  ],
  server: {
    fs: {
      allow: ['.']
    }
  }
})
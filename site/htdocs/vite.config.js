import UnoCSS from 'unocss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [UnoCSS(), sveltekit()],
  server: {
    fs: {
      allow: ['.']
    }
  }
})

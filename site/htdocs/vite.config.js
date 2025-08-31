import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import sveltiaCms from 'astro-sveltia-cms'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [sveltekit(), sveltiaCms(), tailwindcss()],
  server: {
    fs: {
      allow: ['.']
    }
  }
})

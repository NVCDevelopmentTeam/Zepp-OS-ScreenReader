import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import sveltiaCms from 'astro-sveltia-cms'

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), sveltiaCms()],
  server: {
    fs: {
      allow: ['.']
    }
  }
})

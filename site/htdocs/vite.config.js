import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    // UnoCSS plugin first
    UnoCSS(),
    // SvelteKit plugin
    sveltekit()],

  build: {
    // Modern JS target
    target: 'esnext',
    cssTarget: 'esnext',
    // Minify output
    minify: true,
    // Split CSS for better caching
    cssCodeSplit: true,
    // Don't report compressed size (faster)
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Custom chunks
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('sveltia')) return 'cms'
            return 'vendor'
          }
        }
      }
    }
  },

  server: {
    fs: {
      allow: ['.'] // Allow serving files from project root
    }
  }
})

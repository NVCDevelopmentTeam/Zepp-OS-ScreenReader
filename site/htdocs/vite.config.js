import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    UnoCSS(),
    sveltekit(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
      threshold: 1024
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
      threshold: 1024
    })
  ],

  build: {
    target: 'es2022',
    minify: 'esbuild', // built-in Vite, no need to install, faster than terser
    esbuildOptions: {
      drop: ['console', 'debugger'] // replace terser drop_console
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@sveltia/cms')) return 'cms-engine'
          if (id.includes('node_modules/svelte')) return 'svelte-core'
        }
      }
    },
    chunkSizeWarningLimit: 500
  },

  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit']
  },

  server: {
    fs: {
      allow: ['.']
    }
  }
})

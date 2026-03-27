import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'
import { compression } from 'vite-plugin-compression2'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { partytownVite } from '@builder.io/partytown/utils'
import { join } from 'node:path'

export default defineConfig({
  plugins: [
    // Image optimization
    enhancedImages(),
    // UnoCSS plugin
    UnoCSS(),
    // SvelteKit plugin
    sveltekit(),
    // Partytown for 3rd party scripts
    partytownVite({
      dest: join(process.cwd(), 'static', '~partytown')
    }),
    // Brotli compression for static assets
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false
    })
  ],

  build: {
    target: 'esnext',
    cssTarget: 'esnext',
    minify: 'terser', // Terser often produces smaller bundles than esbuild
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
rollupOptions: {
  output: {
    // Custom chunks
    manualChunks: (id) => {
      if (id.includes('node_modules')) {
        if (id.includes('@sveltia/cms')) return 'cms-engine'
        if (id.includes('svelte')) return 'svelte-core'
        return 'vendor'
      }
    }
  }
}

  },

  server: {
    fs: {
      allow: ['.']
    }
  }
})

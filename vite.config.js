import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './app.js'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  },
  optimizeDeps: {
    include: [
      '@guidepup/virtual-screen-reader',
      'braille-translator',
      'espeak-ng'
    ]
  }
});

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import sveltiaCms from 'astro-sveltia-cms';

export default defineConfig({
  plugins: [
    sveltekit(),
    sveltiaCms(),
  ],
  server: {
    fs: {
      allow: ['.'],
    },
  },
});

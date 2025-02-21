import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import sveltiaCms from 'astro-sveltia-cms';
import { partytownVite } from '@builder.io/partytown/utils';
import { join } from 'path';

export default defineConfig({
  plugins: [
    sveltekit(),
    sveltiaCms(),
    partytownVite({
      dest: join(process.cwd(), 'static', '~partytown'),
    }),
  ],
  server: {
    fs: {
      allow: ['.'],
    },
  },
});
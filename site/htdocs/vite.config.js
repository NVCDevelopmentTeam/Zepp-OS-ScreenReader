import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        fs: {
            // Here, '.' references the project root. Adjust as necessary for your case!
            allow: ['.']
        }
    }
});
import adapter from '@sveltejs/adapter-static';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      // Fully static output: plain HTML/CSS/JS in build/, runs on any host
      // 404.html: what the host serves for an address that doesn't exist
      // (routes/+error.svelte)
      adapter: adapter({strict: true, fallback: '404.html'})
    })
  ]
});

import adapter from '@sveltejs/adapter-static';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      // Fully static output: plain HTML/CSS/JS in build/, runs on any host
      adapter: adapter({strict: true})
    })
  ]
});

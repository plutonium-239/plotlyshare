import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "worker-auth-providers": path.resolve(__dirname, 'worker-auth-providers')
    }
  },
  appType: "mpa"
})

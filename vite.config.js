import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Deployed at https://lsnmst.github.io/trancas-no-mapa/  -> base must match the repo name.
// Override with VITE_BASE for local/other deployments if needed.
export default defineConfig({
  plugins: [svelte()],
  base: process.env.VITE_BASE || '/trancas-no-mapa/',
})
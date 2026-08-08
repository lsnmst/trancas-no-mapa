import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { copyFileSync } from "node:fs";

function githubPagesSpaFallback() {
  return {
    name: "github-pages-spa-fallback",
    closeBundle() {
      copyFileSync("dist/index.html", "dist/404.html");
    },
  };
}

export default defineConfig({
  plugins: [svelte(), githubPagesSpaFallback()],
  base: process.env.VITE_BASE || "/trancas-no-mapa/",
});
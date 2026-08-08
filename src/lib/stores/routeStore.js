import { writable } from "svelte/store";
import { slugify } from "../data/estados.js";

const BASE = import.meta.env.BASE_URL || "/";

function parsePath(pathname) {
  let rest = pathname;
  if (rest.startsWith(BASE)) rest = rest.slice(BASE.length);
  const segments = rest.split("/").filter(Boolean);
  const [estadoSlug, cidadeSlug] = segments;
  return {
    estado: estadoSlug ? estadoSlug.toUpperCase() : null,
    cidadeSlug: cidadeSlug || null,
  };
}

export const route = writable(parsePath(window.location.pathname));

window.addEventListener("popstate", () => {
  route.set(parsePath(window.location.pathname));
});

function buildPath(estadoSigla, cidadeNome) {
  let path = BASE;
  if (estadoSigla) {
    path += slugify(estadoSigla) + "/";
    if (cidadeNome) {
      path += slugify(cidadeNome) + "/";
    }
  }
  return path;
}

export function goToHome() {
  history.pushState({}, "", BASE);
  route.set({ estado: null, cidadeSlug: null });
}

export function goToEstado(sigla) {
  const path = buildPath(sigla);
  history.pushState({}, "", path);
  route.set({ estado: sigla, cidadeSlug: null });
}

export function goToCidade(sigla, cidadeNome) {
  const path = buildPath(sigla, cidadeNome);
  history.pushState({}, "", path);
  route.set({ estado: sigla, cidadeSlug: slugify(cidadeNome) });
}

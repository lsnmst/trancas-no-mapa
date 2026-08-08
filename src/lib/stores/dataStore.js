import { writable } from "svelte/store";
import { fetchLiveData, isLiveModeConfigured } from "../api/kobo.js";
import snapshot from "../data/dataset.json";

export const records = writable([]);
export const loading = writable(true);
export const dataSource = writable("snapshot"); // "live" | "snapshot"
export const loadError = writable(null);

let started = false;

export async function initData() {
  if (started) return;
  started = true;

  loading.set(true);
  if (isLiveModeConfigured()) {
    try {
      const live = await fetchLiveData();
      if (live.length > 0) {
        records.set(live);
        dataSource.set("live");
        loading.set(false);
        return;
      }
    } catch (err) {
      console.error("KOBO LIVE ERROR", err);
      loadError.set(err.message || String(err));
      // fall through to snapshot
    }
  }
  records.set(snapshot);
  dataSource.set("snapshot");
  loading.set(false);
}

/** Manual refresh, e.g. from a "atualizar" button, without re-mounting the app. */
export async function refreshLive() {
  if (!isLiveModeConfigured()) return;
  try {
    const live = await fetchLiveData();
    if (live.length > 0) {
      records.set(live);
      dataSource.set("live");
      loadError.set(null);
    }
  } catch (err) {
    loadError.set(err.message || String(err));
  }
}

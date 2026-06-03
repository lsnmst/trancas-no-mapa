<script>
  import { onMount } from 'svelte';
  import { allBraiders, filters, viewMode, uniqueValues } from './lib/stores/braiders.js';
  import { loadBraiders } from './lib/data.js';
  import FilterPanel from './lib/FilterPanel.svelte';
  import MapaBrasil  from './lib/MapaBrasil.svelte';
  import InfoPanel   from './lib/InfoPanel.svelte';

  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const data = await loadBraiders();
      allBraiders.set(data);
      // Default: all years active
      const anos = [...new Set(data.map(b => b.ano))].filter(Boolean).sort();
      filters.update(f => ({ ...f, years: anos }));
    } catch (e) {
      error = e.message;
      console.error('Failed to load CSV:', e);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loading">
    <div class="loading-inner">
      <p class="loading-title">ARQUIVO DE TRANÇAS</p>
      <p class="loading-sub">carregando dados…</p>
    </div>
  </div>
{:else if error}
  <div class="loading">
    <div class="loading-inner">
      <p class="loading-title">erro ao carregar</p>
      <p class="loading-sub">{error}</p>
      <p class="loading-hint">Certifique-se que o arquivo CSV está em <code>public/data/trancadoras.csv</code></p>
    </div>
  </div>
{:else}
  <main>
    <FilterPanel />
    <div class="map-container">
      <MapaBrasil />
    </div>
    <div class="right-panel">
      <InfoPanel />
    </div>
  </main>
{/if}

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(html, body, #app) { height: 100%; }
  :global(body) {
    font-family: 'DM Mono', monospace;
    background: #f5ece4;
    color: #1a0f0a;
  }

  main {
    display: grid;
    grid-template-columns: 210px 1fr 260px;
    height: 100vh;
    overflow: hidden;
  }

  .map-container {
    position: relative;
    height: 100%;
  }

  .right-panel {
    background: #f0c817;
    border-left: 1px solid #e8ddd5;
    padding: 24px 20px;
    overflow-y: auto;
  }

  /* Loading screen */
  .loading {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a0f0a;
  }
  .loading-inner { text-align: center; }
  .loading-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #f5ece4;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
  }
  .loading-sub {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #8a6a5a;
    letter-spacing: 0.1em;
  }
  .loading-hint {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #c23b22;
    margin-top: 12px;
  }
  .loading-hint code {
    background: #2a1a12;
    padding: 2px 6px;
    border-radius: 2px;
  }
</style>

<script>
  import { onMount } from "svelte";
  import { route } from "./lib/stores/routeStore.js";
  import {
    records,
    loading,
    dataSource,
    initData,
  } from "./lib/stores/dataStore.js";
  import { ESTADOS_BY_SIGLA, slugify } from "./lib/data/estados.js";
  import { citiesForEstado } from "./lib/utils/aggregate.js";
  import HomeView from "./lib/views/HomeView.svelte";
  import MapView from "./lib/views/MapView.svelte";
  onMount(() => {
    initData();
  });
  $: estadoValido =
    $route.estado && ESTADOS_BY_SIGLA[$route.estado] ? $route.estado : null;
  $: cidadeResolvida = (() => {
    if (!estadoValido || !$route.cidadeSlug || $records.length === 0) {
      return null;
    }
    const cidades = citiesForEstado($records, estadoValido);
    const match = cidades.find((c) => slugify(c.cidade) === $route.cidadeSlug);
    return match ? match.cidade : null;
  })();
</script>

<main class:mobile-ready={true}>
  {#if $loading}
    <div class="loading-screen">
      <span class="braid-rule" aria-hidden="true"></span>
      <p>Carregando o arquivo das tranças…</p>
    </div>
  {:else if estadoValido}
    <MapView
      records={$records}
      estado={estadoValido}
      cidade={cidadeResolvida}
      dataSource={$dataSource}
    />
  {:else}
    <HomeView records={$records} dataSource={$dataSource} />
  {/if}
</main>

<style>
  main {
    height: 100%;
  }
  .loading-screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: var(--areia-100);
  }
  .loading-screen .braid-rule {
    width: 180px;
  }
  .loading-screen p {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--ink-soft);
  }
</style>

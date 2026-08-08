<script>
  import Sidebar from "../components/Sidebar.svelte";
  import BottomBar from "../components/BottomBar.svelte";
  import StateCityMap from "../components/StateCityMap.svelte";
  import StatsPanel from "../components/StatsPanel.svelte";
  import Gallery from "../components/Gallery.svelte";
  import {
    recordsForEstado,
    recordsForCidade,
    citiesForEstado,
    filterByAnos,
    computeStats,
  } from "../utils/aggregate.js";
  import { estadoNome } from "../data/estados.js";
  import { goToHome, goToEstado, goToCidade } from "../stores/routeStore.js";

  export let records = [];
  export let estado;
  export let cidade = null;
  export let dataSource = "snapshot";

  let anosSelecionados = [];

  function toggleAno(ano) {
    anosSelecionados = anosSelecionados.includes(ano)
      ? anosSelecionados.filter((a) => a !== ano)
      : [...anosSelecionados, ano];
  }

  $: estadoRecordsAllYears = recordsForEstado(records, estado);
  $: estadoRecords = filterByAnos(estadoRecordsAllYears, anosSelecionados);
  $: cidades = citiesForEstado(estadoRecords, estado);
  $: cidadeRecords = cidade ? recordsForCidade(estadoRecords, estado, cidade) : [];
  $: stats = computeStats(estadoRecords);
  $: currentCount = cidade ? cidadeRecords.length : estadoRecords.length;
  $: periodoLabel =
    anosSelecionados.length === 0 || anosSelecionados.length === 3
      ? "no Período 2021–2026"
      : `em ${anosSelecionados.join(", ")}`;
  $: images = cidade ? cidadeRecords.flatMap((r) => r.images || []) : [];
</script>

<div class="view">
  <Sidebar
    {estado}
    {cidade}
    {cidades}
    {anosSelecionados}
    onSelectCidade={(nome) => goToCidade(estado, nome)}
    onClearEstado={goToHome}
    onToggleAno={toggleAno}
  />

  <div class="main">
    {#if cidade}
      <div class="city-top">
        <Gallery {images} />
        <h2>{cidade}</h2>
      </div>
      <div class="map-area">
        <StateCityMap {estado} {cidade} records={estadoRecords} />
      </div>
    {:else}
      <div class="map-area with-panel">
        <div class="map-col">
          <div class="sigla-badge">{estado}</div>
          <StateCityMap {estado} cidade={null} records={estadoRecords} />
        </div>
        <StatsPanel {stats} />
      </div>
    {/if}
    <BottomBar count={currentCount} label={`Trançistas Mapeadas ${periodoLabel}`} dataSource={dataSource} />
  </div>
</div>

<style>
  .view {
    display: flex;
    height: 100%;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .map-area {
    flex: 1;
    min-height: 0;
    display: flex;
  }
  .map-area.with-panel {
    flex-direction: row;
  }
  .map-col {
    position: relative;
    flex: 1;
    min-width: 0;
  }
  .map-col > :global(.map-wrap) {
    height: 100%;
  }
  .sigla-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 500;
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.7rem;
    color: var(--cacau-800);
    background: rgba(255, 253, 248, 0);
    padding: 0.1rem 0.7rem;
    border-radius: 4px;
  }
  .city-top {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--off-white);
    border-bottom: 1px solid var(--line);
  }
  .city-top :global(.gallery) {
    flex: 1;
    min-width: 0;
  }
  .city-top h2 {
    flex-shrink: 0;
    margin: 0;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 500;
    font-size: 1.5rem;
    color: var(--cacau-800);
  }
  .map-area:not(.with-panel) {
    flex-direction: column;
  }
</style>

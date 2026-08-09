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
  import { goToHome, goToCidade, goToEstado } from "../stores/routeStore.js";
  import { estadoNome } from "../data/estados.js";
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
  $: cidadeRecords = cidade
    ? recordsForCidade(estadoRecords, estado, cidade)
    : [];
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

      <div class="map-area city-map">
        <div class="city-map-col">
          <button
            class="map-back"
            on:click={() => goToEstado(estado)}
            aria-label={`Voltar para ${estadoNome(estado)}`}
          >
            ← <span>{estadoNome(estado)}</span>
          </button>

          <StateCityMap {estado} {cidade} records={estadoRecords} />
        </div>
      </div>
    {:else}
      <div class="map-area with-panel">
        <div class="map-col">
          <button
            class="map-back"
            on:click={goToHome}
            aria-label="Voltar ao mapa do Brasil"
          >
            ← <span>Brasil</span>
          </button>

          <div class="sigla-badge">{estado}</div>

          <StateCityMap {estado} cidade={null} records={estadoRecords} />
        </div>
        <StatsPanel {stats} />
      </div>
    {/if}

    <div class="mobile-content">
      <section class="mobile-section">
        <div class="mobile-heading">
          <span>Período</span> <span class="mobile-state">{estado}</span>
        </div>
        <div class="year-list">
          {#each [2021, 2022, 2026] as ano}
            <button
              class:active={anosSelecionados.length === 0 ||
                anosSelecionados.includes(ano)}
              on:click={() => toggleAno(ano)}
            >
              {ano}
            </button>
          {/each}
        </div>
      </section>
      <section class="mobile-section">
        <h3>
          {estado === "DF"
            ? "Selecione a região administrativa quando indicada"
            : "Selecione uma cidade"}
        </h3>
        {#if cidades.length === 0}
          <p class="empty">Nenhuma cidade para este período.</p>
        {:else}
          <div class="city-list">
            {#each cidades as c}
              <button
                class:active={cidade &&
                  cidade.toLowerCase() === c.cidade.toLowerCase()}
                on:click={() => goToCidade(estado, c.cidade)}
              >
                <span>{c.cidade}</span>
                <span class="city-count">{c.count}</span>
              </button>
            {/each}
          </div>
        {/if}
      </section>
      {#if !cidade}
        <section class="mobile-section stats-section">
          <h3>Estatísticas</h3>
          <StatsPanel {stats} />
        </section>
      {/if}
    </div>
    <BottomBar
      count={currentCount}
      label={`Trançistas Mapeadas ${periodoLabel}`}
      {dataSource}
    />
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
    min-height: 0;
  }
  .map-area {
    flex: 1;
    min-height: 0;
    display: flex;
  }
  .map-area.with-panel {
    flex-direction: row;
  }
  .map-col,
  .city-map-col {
    position: relative;
    flex: 1;
    min-width: 0;
  }
  .map-col > :global(.map-wrap) {
    height: 100%;
  }
  .map-back {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 600;

    appearance: none;
    border: 0;
    padding: 0.3rem 0.55rem;

    background: var(--areia-100);
    color: var(--ink-soft);

    border: 1px solid var(--line);
    border-radius: 4px;

    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.04em;

    cursor: pointer;
    backdrop-filter: blur(4px);

    transition:
      background 120ms ease,
      color 120ms ease;
  }
  .map-back:hover {
    background: var(--cacau-600);
    color: var(--terracota-100);
  }
  .map-back span {
    font-family: var(--font-body);
    letter-spacing: 0;
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
  .mobile-content {
    display: none;
  }

  @media (max-width: 700px) {
    .view {
      display: block;
      height: 100%;
    }
    .view > :global(.sidebar) {
      display: none;
    }
    .mobile-content {
      padding-bottom: calc(42px + env(safe-area-inset-bottom));
    }
    .main {
      height: 100%;
    }
    .map-area {
      flex: none;
      height: 55vh;
      min-height: 300px;
    }
    .map-area.with-panel {
      display: block;
    }
    .map-col {
      height: 100%;
    }
    .map-area.with-panel > :global(.stats-panel) {
      display: none;
    }
    .sigla-badge {
      top: 10px;
      right: 10px;
      font-size: 1.35rem;
      padding: 0.15rem 0.5rem;
    }

    .city-top {
      position: absolute;
      z-index: 600;
      top: 10px;
      left: 10px;
      right: 10px;
      width: auto;
      padding: 0.45rem 0.7rem;
      background: rgba(255, 253, 248, 0.9);
      border: 1px solid var(--line);
      border-radius: 6px;
      pointer-events: none;
    }
    .city-top :global(.gallery) {
      display: none;
    }
    .city-top h2 {
      font-size: 1.15rem;
    }
    .mobile-content {
      display: block;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      background: var(--areia-100);
      border-top: 1px solid var(--line);
    }
    .mobile-section {
      padding: 1rem;
      border-bottom: 1px solid var(--line);
    }
    .mobile-heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.7rem;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }
    .mobile-state {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 1rem;
      letter-spacing: 0;
      text-transform: none;
      color: var(--cacau-800);
    }
    .mobile-section h3 {
      margin: 0 0 0.7rem;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }
    .year-list {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .year-list button {
      appearance: none;
      border: 1px solid var(--line);
      background: var(--off-white);
      color: var(--ink);
      min-height: 38px;
      padding: 0 0.85rem;
      border-radius: 999px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      cursor: pointer;
    }
    .year-list button.active {
      background: var(--cacau-800);
      color: var(--off-white);
      border-color: var(--cacau-800);
    }
    .city-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.45rem;
    }
    .city-list button {
      appearance: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      min-width: 0;
      min-height: 42px;
      padding: 0.5rem 0.65rem;
      border: 1px solid var(--line);
      border-radius: 5px;
      background: var(--off-white);
      color: var(--ink);
      text-align: left;
      font-family: var(--font-body);
      font-size: 0.78rem;
      cursor: pointer;
    }
    .city-list button.active {
      border-color: var(--terracota-600);
      background: var(--terracota-100);
      color: var(--cacau-900);
    }
    .city-list button span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .city-count {
      flex-shrink: 0;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--ink-soft);
    }
    .empty {
      margin: 0;
      font-family: var(--font-display);
      font-style: italic;
      font-size: 0.9rem;
      color: var(--ink-soft);
    }

    .stats-section {
      padding: 0;
    }
    .stats-section > h3 {
      padding: 1rem 1rem 0;
      margin-bottom: 0.2rem;
    }
    .stats-section :global(.stats-panel) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: auto;
      padding: 0.5rem 1rem 1rem;
      border-left: 0;
      background: transparent;
      overflow: visible;
    }
    .stats-section :global(.circle-chart) {
      min-width: 0;
      padding: 0.7rem 0.2rem;
    }
    .stats-section :global(.circle-chart h4) {
      font-size: 0.6rem;
    }
    .stats-section :global(.label) {
      font-size: 0.7rem;
    }
    .stats-section :global(.pct) {
      font-size: 0.68rem;
    }
    .city-top {
      display: none;
    }
  }

  @media (max-width: 420px) {
    .map-area {
      height: 52vh;
      min-height: 280px;
    }
    .city-list {
      grid-template-columns: 1fr;
    }
    .stats-section :global(.stats-panel) {
      grid-template-columns: 1fr;
    }
  }
</style>

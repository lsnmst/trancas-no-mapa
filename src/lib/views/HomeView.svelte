<script>
  import Sidebar from "../components/Sidebar.svelte";
  import BottomBar from "../components/BottomBar.svelte";
  import BrazilMap from "../components/BrazilMap.svelte";
  import { countByEstado } from "../utils/aggregate.js";
  import { goToEstado } from "../stores/routeStore.js";
  export let records = [];
  export let dataSource = "snapshot";
  $: countsBySigla = countByEstado(records);
</script>

<div class="view">
  <Sidebar estado={null} />
  <div class="main">
    <div class="map-area">
      <BrazilMap {records} {countsBySigla} onSelectEstado={goToEstado} />
      <div class="mobile-map-title">
        Tranças no Mapa<br />
        <p style="font-size: 1.25rem;margin-block-start: 0">Arquivo das Tranças</p>
      </div>

      <div class="mobile-map-hint">Toque em um estado para explorar</div>
    </div>
    <BottomBar count={records.length} {dataSource} />
  </div>
</div>

<style>
  .view {
    display: flex;
    height: 100%;
  }
  .mobile-map-title {
    display: none;
  }
  .mobile-map-title,
  .mobile-map-hint {
    display: none;
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
  }
  .map-area :global(.map-wrap) {
    height: 100%;
  }
  @media (max-width: 700px) {
    .view {
      display: block;
    }
    .view > :global(.sidebar) {
      display: none;
    }
    .main {
      height: 100%;
    }
    .map-area {
      flex: 1;
      min-height: 0;
    }
    .mobile-map-title {
      display: block;
      position: absolute;
      top: 10px;
      right: 12px;
      z-index: 500;

      font-family: var(--font-display);
      font-style: italic;
      font-size: 0.9rem;
      color: var(--cacau-800);
      text-align: right;

      padding: 0.25rem 0.5rem;
      border-radius: 3px;

      pointer-events: none;
    }
    .mobile-map-hint {
      display: block;
      position: absolute;
      left: 50%;
      bottom: 10%;
      transform: translateX(-50%);

      z-index: 500;

      white-space: nowrap;

      font-family: var(--font-mono);
      font-size: 0.62rem;
      letter-spacing: 0.04em;

      color: var(--cacau-800);

      padding: 0.45rem 0.7rem;
      border: 1px solid var(--line);
      border-radius: 999px;

      pointer-events: none;
    }
  }
</style>

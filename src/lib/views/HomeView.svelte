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
    <BrazilMap {records} {countsBySigla} onSelectEstado={goToEstado} />
    <BottomBar count={records.length} dataSource={dataSource} />
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
  .main > :global(.map-wrap) {
    flex: 1;
    min-height: 0;
  }
</style>

<script>
  import CircleChart from "./CircleChart.svelte";
  import DotListChart from "./DotListChart.svelte";
  export let stats;
</script>

<aside class="stats-panel" aria-label="Estatísticas do estado">
  <CircleChart
    title="Gerações de trancistas"
    items={stats.geracoes.items}
    color="var(--terracota-500)"
  />
  <CircleChart
    title="Aprenderam"
    subtitle="% das pessoas que marcaram cada opção"
    items={stats.comoAprendeu.items}
    color="var(--cacau-600)"
  />
  <CircleChart
    title="Ensinam"
    items={stats.ensina.items}
    color="var(--milho-500)"
  />
  <CircleChart
    title="Onde trançam"
    subtitle="% das pessoas que marcaram cada opção"
    items={stats.onde.items}
    color="var(--terracota-600)"
  />
</aside>

<style>
  .stats-panel {
    width: 280px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 1.25rem 1.25rem 2rem;
    background: var(--off-white);
    border-left: 1px solid var(--line);
  }
</style>

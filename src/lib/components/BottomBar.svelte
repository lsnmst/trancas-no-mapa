<script>
  export let count = 0;
  export let label = "Trançistas No Mapa";
  export let dataSource = "snapshot";
</script>

<footer class="bottom-bar">
  <p><span class="count">{count}</span> {label}</p>
  <!-- {#if dataSource === "snapshot"}
    <p class="source">amostra local</p>
  {:else}
    <p class="source">dados em tempo real · kobo</p>
  {/if} -->
</footer>

<style>
  .bottom-bar {
    height: 44px;
    flex-shrink: 0;
    background: var(--milho-400);
    color: var(--cacau-900);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0 1.5rem;
  }
  p {
    margin: 0;
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1rem;
  }
  .count {
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 700;
    margin-right: 0.2rem;
  }
  .source {
    font-family: var(--font-mono);
    font-style: normal;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.65;
  }

  @media (max-width: 700px) {
    .bottom-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2000;

      height: 42px;
      min-height: 42px;

      padding-bottom: env(safe-area-inset-bottom);
    }
  }
</style>

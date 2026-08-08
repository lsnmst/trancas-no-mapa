<script>
  export let title = "";
  export let subtitle = "";
  export let items = []; // [{ label, pct, count }]
  export let color = "var(--terracota-500)";

  const MIN_R = 5;
  const MAX_R = 26;
  const ROW_H = 46;
  const CX = 30;
  const PAD_TOP = 22;

  $: rows = items.map((item, i) => ({
    ...item,
    r: MIN_R + (Math.max(item.pct, 0) / 100) * (MAX_R - MIN_R),
    cy: PAD_TOP + i * ROW_H,
  }));
  $: height = items.length
    ? PAD_TOP + (items.length - 1) * ROW_H + MAX_R + 14
    : 0;
</script>

<section class="circle-chart">
  <h4>{title}</h4>
  {#if subtitle}
    <h4 class="subtitle" style="font-size: 0.6rem;" >{subtitle}</h4>
  {/if}
  {#if items.length === 0}
    <p class="empty">Sem dados para este filtro.</p>
  {:else}
    <svg viewBox="0 0 60 {height}" width="60" {height} aria-hidden="true">
      {#if rows.length > 1}
        <line
          x1={CX}
          y1={rows[0].cy}
          x2={CX}
          y2={rows[rows.length - 1].cy}
          stroke={color}
          stroke-width="1"
          opacity="0.55"
        />
      {/if}
      {#each rows as row}
        <circle
          cx={CX}
          cy={row.cy}
          r={row.r}
          fill="none"
          stroke={color}
          stroke-width="1.6"
        />
      {/each}
    </svg>
    <ul class="legend" style="--row-h:{ROW_H}px; --pad-top:{PAD_TOP}px;">
      {#each rows as row}
        <li style="height:{ROW_H}px">
          <span class="pct">{row.pct}%</span>
          <span class="label">{row.label}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .circle-chart {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 0.2rem 0.4rem;
    padding-block: 0.6rem;
    border-bottom: 1px solid var(--line);
  }
  .circle-chart:last-child {
    border-bottom: none;
  }
  h4 {
    grid-column: 1 / -1;
    margin: 0 0 0.2rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  svg {
    grid-column: 1;
    flex-shrink: 0;
  }
  .legend {
    grid-column: 2;
    list-style: none;
    margin: 0;
    padding: 0;
    padding-top: var(--pad-top);
  }
  .legend li {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    line-height: 1;
  }
  .pct {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--terracota-600);
    min-width: 2.4em;
  }
  .label {
    font-size: 0.78rem;
    color: var(--ink);
  }
  .empty {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 0.8rem;
    color: var(--ink-soft);
    font-style: italic;
  }
</style>

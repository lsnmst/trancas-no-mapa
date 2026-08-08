<script>
    export let title = "";
    export let items = []; 
    export let color = "var(--terracota-500)";

    const MIN_R = 3;
    const MAX_R = 11;
    const ROW_H = 34;
    const CX = 18;
    const PAD_TOP = 16;

    $: rows = items.map((item, i) => ({
        ...item,
        r: MIN_R + (Math.max(item.pct, 0) / 100) * (MAX_R - MIN_R),
        cy: PAD_TOP + i * ROW_H,
    }));

    $: height =
        rows.length > 0 ? PAD_TOP + (rows.length - 1) * ROW_H + ROW_H / 2 : 0;
</script>

```svelte
<section class="dot-chart">
    <h4>{title}</h4>

    {#if rows.length === 0}
        <p class="empty">Sem dados para este filtro.</p>
    {:else}
        <svg viewBox="0 0 36 {height}" width="36" {height} aria-hidden="true">
            {#each rows as row}
                <circle
                    cx={CX}
                    cy={row.cy}
                    r={row.r}
                    fill={color}
                    fill-opacity="0.18"
                    stroke={color}
                    stroke-width="1.5"
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
```

<style>
    .dot-chart {
        display: grid;
        grid-template-columns: 36px 1fr;
        gap: 0.2rem 0.6rem;
        padding-block: 0.7rem;
        border-bottom: 1px solid var(--line);
    }

    .dot-chart:last-child {
        border-bottom: none;
    }

    h4 {
        grid-column: 1 / -1;
        margin: 0 0 0.35rem;
        font-family: var(--font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-soft);
    }

    svg {
        grid-column: 1;
        overflow: visible;
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
        align-items: center;
        gap: 0.55rem;
    }

    .pct {
        min-width: 2.6em;
        font-family: var(--font-mono);
        font-size: 0.78rem;
        color: var(--terracota-600);
    }

    .label {
        font-size: 0.8rem;
        color: var(--ink);
        line-height: 1.2;
    }

    .empty {
        grid-column: 1 / -1;
        margin: 0;
        font-size: 0.8rem;
        color: var(--ink-soft);
        font-style: italic;
    }
</style>

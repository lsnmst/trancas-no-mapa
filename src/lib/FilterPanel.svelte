<script>
  import { filters, viewMode, uniqueValues } from "./stores/braiders.js";

  function toggleYear(y) {
    filters.update((f) => ({
      ...f,
      years: f.years.includes(y)
        ? f.years.filter((x) => x !== y)
        : [...f.years, y],
    }));
  }

  function resetAll() {
    filters.update((f) => ({
      ...f,
      estado: null,
      cidade: null,
      tipoArea: null,
      comoAprendeu: null,
      ensina: null,
      renda: null,
    }));
    viewMode.set("nacional");
  }

  $: hasActiveFilters =
    $filters.estado ||
    $filters.tipoArea ||
    $filters.comoAprendeu ||
    $filters.ensina != null ||
    $filters.renda != null;
</script>

<aside class="panel">
  <div class="panel-header">
    <h2 class="brand">ARQUIVO<br />DAS TRANÇAS</h2>
    <p class="brand-sub">mapeamento nacional</p>
  </div>

  <div class="divider" />

  <!-- Year toggles -->
  <div class="section">
    <span class="label">período</span>
    <div class="year-group">
      {#each $uniqueValues.anos as ano}
        <button
          class="year-btn"
          class:active={$filters.years.includes(ano)}
          on:click={() => toggleYear(ano)}
        >
          {ano}
        </button>
      {/each}
    </div>
  </div>

  <div class="divider" />

  <!-- Estado -->
  <div class="section">
    <span class="label">estado</span>
    <select
      class="select"
      value={$filters.estado ?? ""}
      on:change={(e) => {
        const val = e.target.value || null;
        filters.update((f) => ({ ...f, estado: val, cidade: null }));
        viewMode.set("nacional");
      }}
    >
      <option value="">todos</option>
      {#each $uniqueValues.estados as e}
        <option value={e}>{e}</option>
      {/each}
    </select>
  </div>

  <!-- Tipo de área -->
  <div class="section">
    <span class="label">tipo de área</span>
    <select
      class="select"
      value={$filters.tipoArea ?? ""}
      on:change={(e) =>
        filters.update((f) => ({ ...f, tipoArea: e.target.value || null }))}
    >
      <option value="">todas</option>
      {#each $uniqueValues.tiposArea as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
  </div>

  <!-- Como aprendeu -->
  <div class="section">
    <span class="label">aprendizado</span>
    <select
      class="select"
      value={$filters.comoAprendeu ?? ""}
      on:change={(e) =>
        filters.update((f) => ({ ...f, comoAprendeu: e.target.value || null }))}
    >
      <option value="">todos</option>
      {#each $uniqueValues.aprendizados as a}
        <option value={a}>{a}</option>
      {/each}
    </select>
  </div>

  <div class="divider" />

  <!-- Ensina -->
  <div class="section">
    <span class="label">ensina</span>
    <div class="radio-group">
      {#each [["", "todas"], ["sim", "sim"], ["não", "não"]] as [val, label]}
        <label class="radio-label">
          <input
            type="radio"
            name="ensina"
            checked={val === ""
              ? $filters.ensina == null
              : $filters.ensina === (val === "sim")}
            on:change={() =>
              filters.update((f) => ({
                ...f,
                ensina: val === "" ? null : val === "sim",
              }))}
          />
          {label}
        </label>
      {/each}
    </div>
  </div>

  <!-- Renda -->
  <div class="section">
    <span class="label">principal renda</span>
    <div class="radio-group">
      {#each [["", "todas"], ["sim", "sim"], ["não", "não"]] as [val, label]}
        <label class="radio-label">
          <input
            type="radio"
            name="renda"
            checked={val === ""
              ? $filters.renda == null
              : $filters.renda === (val === "sim")}
            on:change={() =>
              filters.update((f) => ({
                ...f,
                renda: val === "" ? null : val === "sim",
              }))}
          />
          {label}
        </label>
      {/each}
    </div>
  </div>

  {#if hasActiveFilters}
    <div class="divider" />
    <button class="reset-btn" on:click={resetAll}>↺ limpar filtros</button>
  {/if}
</aside>

<style>
  .panel {
    background: #1a0f0a;
    color: #f5ece4;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    padding: 24px 20px 32px;
    font-family: "DM Mono", monospace;
    border-right: 1px solid #3d2b1f;
  }

  .panel-header {
    margin-bottom: 4px;
  }

  .brand {
    font-family: "Yeseva One", serif;
    font-size: 22px;
    font-style: italic;
    line-height: 1.15;
    letter-spacing: 0.02em;
    color: #f5ece4;
    margin: 0 0 6px;
    font-weight: 400;
  }

  .brand-sub {
    font-family: "DM Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8a6a5a;
    margin: 0;
  }

  .divider {
    height: 1px;
    background: #3d2b1f;
    margin: 16px 0;
  }

  .section {
    margin-bottom: 14px;
  }

  .label {
    display: block;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #8a6a5a;
    margin-bottom: 6px;
  }

  .year-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .year-btn {
    background: none;
    border: 1px solid #3d2b1f;
    color: #8a6a5a;
    font-family: "DM Mono", monospace;
    font-size: 12px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s;
    border-radius: 2px;
  }
  .year-btn:hover {
    border-color: #8a6a5a;
    color: #f5ece4;
  }
  .year-btn.active {
    background: #c23b22;
    border-color: #c23b22;
    color: #fff;
  }

  .select {
    width: 100%;
    background: #2a1a12;
    border: 1px solid #3d2b1f;
    color: #f5ece4;
    font-family: "DM Mono", monospace;
    font-size: 12px;
    padding: 6px 8px;
    border-radius: 2px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a6a5a'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 24px;
  }
  .select:focus {
    border-color: #c23b22;
  }

  .radio-group {
    display: flex;
    gap: 12px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #c4a99a;
    cursor: pointer;
  }
  .radio-label input[type="radio"] {
    accent-color: #c23b22;
    cursor: pointer;
  }

  .reset-btn {
    background: none;
    border: 1px solid #c23b22;
    color: #c23b22;
    font-family: "DM Mono", monospace;
    font-size: 11px;
    padding: 7px 12px;
    cursor: pointer;
    letter-spacing: 0.05em;
    border-radius: 2px;
    transition: all 0.15s;
    width: 100%;
  }
  .reset-btn:hover {
    background: #c23b22;
    color: #fff;
  }
</style>

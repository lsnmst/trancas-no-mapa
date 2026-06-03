<script>
  import {
    filters,
    filtered,
    viewMode,
    citiesInEstado,
    byBairro,
    imagesInCidade,
  } from "./stores/braiders.js";
  import { stateNames } from "./stores/states.js";

  function getEstadoName(sigla) {
    return stateNames[sigla] ?? sigla;
  }

  // Dynamic subtitle based on active filters
  $: subtitle = (() => {
    const f = $filters;
    const total = $filtered.length;

    const parts = [];
    // --- base (contesto geografico)
    const base = f.cidade
      ? `${total} trançista${total !== 1 ? "s" : ""} em ${f.cidade}`
      : f.estado
        ? `${total} trançista${total !== 1 ? "s" : ""} mapeada${total !== 1 ? "s" : ""} no estado`
        : `${total} trançista${total !== 1 ? "s" : ""} mapeadas no Brasil`;
    // --- years range
    if (f.years && f.years.length > 0) {
      const sorted = [...f.years].sort();
      const yearLabel =
        sorted.length === 1
          ? `${sorted[0]}`
          : `${sorted[0]}–${sorted[sorted.length - 1]}`;

      parts.push(`entre ${yearLabel}`);
    }
    // --- tipo area
    if (f.tipoArea) {
      parts.push(`em áreas ${f.tipoArea}`);
    }
    // --- como aprendeu (normalizzazione semantica)
    if (f.comoAprendeu) {
      const map = {
        sozinha: "que aprenderam sozinhas",
        familia: "que aprenderam em família",
        familiar: "que aprenderam em família",
      };
      parts.push(
        map[f.comoAprendeu] ?? `que aprenderam ${f.comoAprendeu.toLowerCase()}`,
      );
    }
    // --- ensina
    if (f.ensina != null) {
      parts.push(f.ensina ? "que ensinam" : "que não ensinam");
    }
    // --- renda
    if (f.renda != null) {
      parts.push(f.renda ? "renda principal" : "renda complementar");
    }
    return parts.length ? `${base},\n${parts.join(", ")}` : base;
  })();

  // City-level breakdown for estado view
  $: cityBreakdown = (() => {
    if (!$filters.estado || $filters.cidade) return [];
    const acc = {};
    $filtered
      .filter((b) => b.estado === $filters.estado)
      .forEach((b) => {
        acc[b.cidade] = (acc[b.cidade] ?? 0) + 1;
      });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  })();

  function zoomCity(cidade) {
    filters.update((f) => ({ ...f, cidade }));
    viewMode.set("cidade");
  }

  function backToEstado() {
    filters.update((f) => ({ ...f, cidade: null }));
    viewMode.set("nacional");
  }

  function backToNacional() {
    filters.update((f) => ({ ...f, estado: null, cidade: null }));
    viewMode.set("nacional");
  }
</script>

<section class="info">
  <!-- Breadcrumb -->
  <div class="breadcrumb">
    <button class:active={!$filters.estado} on:click={backToNacional}
      >Brasil</button
    >
    {#if $filters.estado}
      <span class="sep">›</span>
      <button class:active={!$filters.cidade} on:click={backToEstado}
        >{$filters.estado}</button
      >
    {/if}
    {#if $filters.cidade}
      <span class="sep">›</span>
      <span class="crumb-active">{$filters.cidade}</span>
    {/if}
  </div>

  <!-- Title -->
  <h1 class="title">
    {#if $filters.cidade}
      {$filters.cidade.toUpperCase()}
    {:else if $filters.estado}
      {getEstadoName($filters.estado).toUpperCase()}
    {:else}
      BRASIL
    {/if}
  </h1>

  <p class="subtitle">{subtitle}</p>

  <div class="divider" />

  <!-- City list (estado view) -->
  {#if $filters.estado && !$filters.cidade && cityBreakdown.length > 0}
    <div class="city-list">
      {#each cityBreakdown as [cidade, count]}
        <div class="city-row">
          <span class="city-name">{cidade.toUpperCase()}</span>
          <span class="city-count">{count}</span>
          <button
            class="zoom-btn"
            on:click={() => zoomCity(cidade)}
            title="Ver bairros"
          >
            ⊕
          </button>
        </div>
      {/each}
    </div>
    <div class="divider" />
  {/if}

  <!-- Bairro list (cidade view) -->
  {#if $filters.cidade && $byBairro.length > 0}
    <div class="bairro-list">
      <span class="section-label">por bairro</span>
      {#each $byBairro as b}
        <div class="bairro-row">
          <span class="bairro-name">{b.bairro}</span>
          <span class="bairro-count">{b.count}</span>
        </div>
      {/each}
    </div>
    <div class="divider" />
  {/if}

  <!-- Photo archive -->
  {#if $imagesInCidade.length > 0}
    <div class="arquivo">
      <span class="section-label">arquivo das tranças</span>
      <div class="photo-grid">
        {#each $imagesInCidade as b}
          <div class="photo-item">
            <img
              src={b.linkImagem}
              alt={`Trançista em ${b.cidade}`}
              loading="lazy"
            />
            {#if b.bairro}
              <span class="photo-caption">{b.bairro}</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {:else if $filters.cidade}
    <div class="arquivo">
      <span class="section-label">arquivo das tranças</span>
      <p class="no-photos">nenhuma imagem disponível para esta cidade</p>
    </div>
  {/if}

  <!-- Stats snapshot -->
  {#if $filtered.length > 0}
    <div class="divider" />
    <div class="stats">
      <span class="section-label">dados</span>
      <div class="stat-grid">
        <div class="stat">
          <span class="stat-val"
            >{$filtered.filter((b) => b.ensina).length}</span
          >
          <span class="stat-key">ensinam</span>
        </div>
        <div class="stat">
          <span class="stat-val">{$filtered.filter((b) => b.renda).length}</span
          >
          <span class="stat-key">renda principal</span>
        </div>
        {#if !$filters.estado && !$filters.cidade}
          <div class="stat">
            <span class="stat-val"
              >{[...new Set($filtered.map((b) => b.estado))].length}</span
            >
            <span class="stat-key"
              >estado{[...new Set($filtered.map((b) => b.estado))].length !== 1
                ? "s"
                : ""}</span
            >
          </div>
          <div class="stat">
            <span class="stat-val">
              {[...new Set($filtered.map((b) => b.cidade))].length}
            </span>
            <span class="stat-key">
              cidade{[...new Set($filtered.map((b) => b.cidade))].length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .info {
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: "DM Mono", monospace;
    height: 100%;
    overflow-y: auto;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .breadcrumb button {
    background: none;
    border: none;
    font-family: "DM Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a6a5a;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .breadcrumb button:hover {
    color: #c23b22;
  }
  .breadcrumb button.active {
    color: #3d2b1f;
    pointer-events: none;
  }
  .sep {
    color: #c4a99a;
    font-size: 10px;
  }
  .crumb-active {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3d2b1f;
  }

  .title {
    font-family: "Yeseva One", serif;
    font-style: italic;
    font-size: 28px;
    font-weight: 400;
    letter-spacing: 0.03em;
    color: #1a0f0a;
    margin: 0 0 8px;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 11px;
    color: #6b4f42;
    line-height: 1.6;
    white-space: pre-line;
    margin: 0;
  }

  .divider {
    height: 1px;
    background: #b6aa3c;
    margin: 16px 0;
  }

  .section-label {
    display: block;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #8a6a5a;
    margin-bottom: 10px;
  }

  /* City list */
  .city-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .city-row {
    display: flex;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #b6aa3c;
    gap: 8px;
  }
  .city-name {
    flex: 1;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #1a0f0a;
  }
  .city-count {
    font-size: 12px;
    color: #c23b22;
    min-width: 24px;
    text-align: right;
  }
  .zoom-btn {
    background: none;
    border: 1px solid #817a39;
    color: #494340;
    font-size: 14px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 2px;
    padding: 0;
    transition: all 0.15s;
    line-height: 1;
  }
  .zoom-btn:hover {
    border-color: #c23b22;
    color: #c23b22;
  }

  /* Bairro list */
  .bairro-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .bairro-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #f0e8e0;
  }
  .bairro-name {
    font-size: 11px;
    color: #3d2b1f;
  }
  .bairro-count {
    font-size: 11px;
    color: #c23b22;
  }

  /* Photo archive */
  .arquivo {
  }
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .photo-item {
    position: relative;
  }
  .photo-item img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
    border-radius: 2px;
  }
  .photo-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(26, 15, 10, 0.7);
    color: #f5ece4;
    font-size: 9px;
    padding: 3px 5px;
    letter-spacing: 0.05em;
    border-radius: 0 0 2px 2px;
  }
  .no-photos {
    font-size: 11px;
    color: #8a6a5a;
    font-style: italic;
    margin: 0;
  }

  /* Stats */
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .stat-val {
    font-family: "DM Serif Display", serif;
    font-size: 24px;
    color: #1a0f0a;
    line-height: 1;
  }
  .stat-key {
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a6a5a;
  }
</style>

<script>
  import { ANOS } from "../utils/koboFields.js";
  import { estadoNome, slugify } from "../data/estados.js";

  export let estado = null;
  export let cidade = null;
  export let cidades = [];
  export let anosSelecionados = [];
  export let onSelectCidade = () => {};
  export let onClearEstado = () => {};
  export let onToggleAno = () => {};
</script>

<nav class="sidebar" aria-label="Filtros do mapa">
  <header class="brand">
    <p class="eyebrow">Tranças no Mapa</p>
    <h1>Arquivo<br />das Tranças</h1>
    <span class="braid-rule" aria-hidden="true"></span>
  </header>

  <section class="block">
    <h2>Selecione um estado</h2>
    {#if estado}
      <button class="estado-pill" on:click={onClearEstado}>
        <span class="sigla">{estado}</span>
        <span class="nome">{estadoNome(estado)}</span>
        <span class="clear" aria-hidden="true">✕</span>
      </button>
    {:else}
      <p class="hint">Clique em um estado destacado no mapa.</p>
    {/if}
  </section>

  {#if estado}
    <section class="block">
      <h2>Período</h2>
      <div class="periodo">
        {#each ANOS as ano}
          <button
            class="ano-pill"
            class:active={anosSelecionados.length === 0 ||
              anosSelecionados.includes(ano)}
            on:click={() => onToggleAno(ano)}
          >
            {ano}
          </button>
        {/each}
      </div>
    </section>

    <section class="block cities">
      <h2>
        {estado === "DF"
          ? "Selecione a região administrativa"
          : "Selecione uma cidade"}
      </h2>
      {#if cidades.length === 0}
        <p class="hint">Nenhuma cidade para este período.</p>
      {:else}
        <ul>
          {#each cidades as c}
            <li>
              <button
                class:active={cidade && slugify(cidade) === slugify(c.cidade)}
                on:click={() => onSelectCidade(c.cidade)}
              >
                {c.cidade}
                <span class="count">{c.count}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</nav>

<style>
  .sidebar {
    width: var(--sidebar-w);
    flex-shrink: 0;
    height: 100%;
    background: var(--cacau-800);
    color: var(--areia-100);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .brand {
    padding: 1.6rem 1.5rem 1.1rem;
  }
  .eyebrow {
    margin: 0 0 0.15rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--terracota-300);
  }
  h1 {
    margin: 0 0 1rem;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 500;
    font-size: 1.9rem;
    line-height: 1.05;
    color: var(--off-white);
  }

  .block {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .block.cities {
    flex: 1;
  }
  h2 {
    margin: 0 0 0.7rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--terracota-300);
  }
  .hint {
    margin: 0;
    font-size: 0.82rem;
    color: rgba(250, 245, 234, 0.6);
    font-style: italic;
  }

  .estado-pill {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: var(--cacau-700);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    padding: 0.55rem 0.8rem;
    color: var(--off-white);
    cursor: pointer;
    text-align: left;
  }
  .estado-pill:hover {
    background: var(--cacau-600);
  }
  .estado-pill .sigla {
    font-family: var(--font-mono);
    font-weight: 500;
    color: var(--terracota-300);
  }
  .estado-pill .nome {
    flex: 1;
    font-size: 0.85rem;
  }
  .estado-pill .clear {
    opacity: 0.6;
    font-size: 0.75rem;
  }

  .periodo {
    display: flex;
    gap: 0.4rem;
  }
  .ano-pill {
    flex: 1;
    padding: 0.4rem 0;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 999px;
    color: rgba(250, 245, 234, 0.55);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    cursor: pointer;
  }
  .ano-pill.active {
    background: var(--terracota-500);
    border-color: var(--terracota-500);
    color: var(--cacau-900);
    font-weight: 500;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  li button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    border: none;
    color: rgba(250, 245, 234, 0.85);
    padding: 0.45rem 0.6rem;
    border-radius: 3px;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
  }
  li button:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  li button.active {
    background: var(--terracota-500);
    color: var(--cacau-900);
    font-weight: 500;
  }
  .count {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    opacity: 0.75;
  }
</style>

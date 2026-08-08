<script>
  export let images = []; // [{ url, thumbUrl }]
</script>

<div class="gallery" class:empty={images.length === 0}>
  {#if images.length === 0}
    <p class="placeholder">Nenhuma imagem registrada para esta cidade ainda.</p>
  {:else}
    {#each images as img}
      <a class="frame" href={img.url} target="_blank" rel="noopener noreferrer">
        <img src={img.thumbUrl || img.url} alt="Registro iconográfico de trança" loading="lazy" />
      </a>
    {/each}
  {/if}
</div>

<style>
  .gallery {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.4rem;
    scrollbar-width: thin;
  }
  .gallery.empty {
    align-items: center;
  }
  .frame {
    flex: 0 0 auto;
    width: 96px;
    height: 96px;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid var(--line);
    background: var(--areia-200);
  }
  .frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .placeholder {
    margin: 0;
    font-size: 0.82rem;
    color: var(--ink-soft);
    font-style: italic;
  }
</style>

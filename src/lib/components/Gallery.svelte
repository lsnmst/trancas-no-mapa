<script>
  export let images = [];

  let selectedIndex = -1;

  $: selectedImage = selectedIndex >= 0 ? images[selectedIndex] : null;

  function openImage(index) {
    selectedIndex = index;
  }

  function closeImage() {
    selectedIndex = -1;
  }

  function previousImage(event) {
    event?.stopPropagation();
    selectedIndex =
      (selectedIndex - 1 + images.length) % images.length;
  }

  function nextImage(event) {
    event?.stopPropagation();
    selectedIndex = (selectedIndex + 1) % images.length;
  }

  function handleKeydown(event) {
    if (selectedIndex < 0) return;

    if (event.key === "Escape") closeImage();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "ArrowRight") nextImage();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="gallery" class:empty={images.length === 0}>
  {#if images.length === 0}
    <p class="placeholder">
      Nenhuma imagem registrada para esta cidade ainda.
    </p>
  {:else}
    {#each images as img, i}
      <button
        class="frame"
        type="button"
        aria-label="Ampliar imagem {i + 1}"
        on:click={() => openImage(i)}
      >
        <img
          src={img.thumbUrl || img.url}
          alt="Registro iconográfico de trança"
          loading="lazy"
        />
      </button>
    {/each}
  {/if}
</div>

{#if selectedImage}
  <div
    class="lightbox"
    role="presentation"
    on:click={closeImage}
  >
    <button
      class="close"
      type="button"
      aria-label="Fechar imagem"
      on:click={closeImage}
    >
      ×
    </button>

    {#if images.length > 1}
      <button
        class="nav previous"
        type="button"
        aria-label="Imagem anterior"
        on:click={previousImage}
      >
        ‹
      </button>
    {/if}

    <img
      class="lightbox-image"
      src={selectedImage.url}
      alt="Registro iconográfico de trança ampliado"
      on:click={(event) => event.stopPropagation()}
    />

    {#if images.length > 1}
      <button
        class="nav next"
        type="button"
        aria-label="Próxima imagem"
        on:click={nextImage}
      >
        ›
      </button>
    {/if}

    <div class="counter">
      {selectedIndex + 1} / {images.length}
    </div>
  </div>
{/if}

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
    padding: 0;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid var(--line);
    background: var(--areia-200);
    cursor: zoom-in;
  }

  .frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.25s ease;
  }

  .frame:hover img {
    transform: scale(1.08);
  }

  .placeholder {
    margin: 0;
    font-size: 0.82rem;
    color: var(--ink-soft);
    font-style: italic;
  }

  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(24, 18, 15, 0.92);
    padding: 3.5rem;
  }

  .lightbox-image {
    display: block;
    max-width: 90vw;
    max-height: 85vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 3px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
  }

  .close,
  .nav {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background: rgba(255, 255, 255, 0);
    border: 1px solid rgba(255, 255, 255, 0);
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .close:hover,
  .nav:hover {
    background: rgba(255, 255, 255, 0);
  }

  .close {
    top: 20px;
    right: 24px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    font-size: 2rem;
    line-height: 1;
  }

  .nav {
    top: 50%;
    transform: translateY(-50%);
    width: 46px;
    height: 46px;
    border-radius: 50%;
    font-size: 2.5rem;
    line-height: 1;
  }

  .previous {
    left: 24px;
  }

  .next {
    right: 24px;
  }

  .counter {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.8);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
  }
  

  @media (max-width: 700px) {
    .lightbox {
      padding: 1rem;
    }

    .lightbox-image {
      max-width: 94vw;
      max-height: 78vh;
    }

    .close {
      top: 14px;
      right: 14px;
    }

    .nav {
      width: 38px;
      height: 38px;
      font-size: 2rem;
    }

    .previous {
      left: 8px;
    }

    .next {
      right: 8px;
    }
  }
</style>

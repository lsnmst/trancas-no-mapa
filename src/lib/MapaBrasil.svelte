<script>
  import { onMount, onDestroy } from "svelte";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import {
    filters,
    viewMode,
    byCidade,
    byBairro,
    byEstado,
    visibleCities,
  } from "./stores/braiders.js";

  let mapEl;
  let map;

  let markersLayer;
  let estadosLayer;

  let geojsonData;
  let initialized = false;

  const BRASIL_CENTER = [-14.235, -51.925];
  const BRASIL_ZOOM = 4;

  // -------------------------
  // HELPERS (IMPORTANTISSIMO)
  // -------------------------
  function getEstadoMeta(sigla) {
    return $byEstado.find((e) => e.estado === sigla);
  }

  function isSelected(sigla) {
    return $filters.estado === sigla;
  }

  function hasData(sigla) {
    return !!getEstadoMeta(sigla);
  }

  // -------------------------
  // CITY MARKERS
  // -------------------------
  function makeCircle(lat, lng, count, label, color, onClick) {
    const group = L.layerGroup();

    const circle = L.circleMarker([lat, lng], {
      radius: 1 + Math.sqrt(count) * 5.5,
      color: "#fff",
      fillColor: color,
      fillOpacity: 0.82,
      weight: 1.5,
    });

    circle.bindTooltip(
      `<div class="tt">
        <strong>${label}</strong><br/>
        <span>${count} trançadora${count !== 1 ? "s" : ""}</span>
      </div>`,
      {
        direction: "top",
        offset: [0, -6],
        className: "map-tooltip",
      },
    );

    if (onClick) circle.on("click", onClick);

    group.addLayer(circle);
    return group;
  }

  $: showStateHint =
    $filters.estado && !$filters.cidade && $byCidade.length > 0;

  function renderNacional() {
    if (!markersLayer) return;

    markersLayer.clearLayers();

    const isEstadoLocked = !!$filters.estado;

    $visibleCities.forEach((p) => {
      makeCircle(
        p.lat,
        p.lng,
        p.count,
        p.cidade,
        isSelected(p.estado) ? "#c23b22" : "#3d2b1f",
        () => {
          if (isEstadoLocked) return; // 🚫 blocco interazione

          filters.update((f) => ({
            ...f,
            estado: p.estado,
            cidade: p.cidade,
          }));

          viewMode.set("cidade");
          map.flyTo([p.lat, p.lng], 13, { duration: 0.8 });
        },
      ).addTo(markersLayer);
    });
  }

  function renderCidade() {
    if (!markersLayer) return;

    markersLayer.clearLayers();

    $byBairro.forEach((p) => {
      makeCircle(p.lat, p.lng, p.count, p.bairro, "#c23b22", null).addTo(
        markersLayer,
      );
    });
  }

  // -------------------------
  // STATES STYLE (SINGOLA FONTE DI VERITÀ)
  // -------------------------
  function getEstadoStyle(feature) {
    const sigla = feature.properties.sigla;

    const selected = isSelected(sigla);
    const data = hasData(sigla);
    const clickable = hasData(sigla);

    return {
      color: selected ? "#c23b22" : "#3d2b1f",
      weight: selected ? 5 : data ? 1.5 : 0.3,
      opacity: selected ? 1 : data ? 0.4 : 0.1,
      fillOpacity: 0,
      className: clickable ? "estado-clickable" : "estado-disabled",
    };
  }

  function updateEstadosStyle() {
    if (!estadosLayer) return;

    estadosLayer.eachLayer((layer) => {
      layer.setStyle(getEstadoStyle(layer.feature));

      if (isSelected(layer.feature.properties.sigla)) {
        layer.bringToFront();
      }
    });
  }

  function focusEstado(sigla) {
    if (!estadosLayer || !map) return;

    let targetLayer = null;

    estadosLayer.eachLayer((layer) => {
      if (layer.feature.properties.sigla === sigla) {
        targetLayer = layer;
      }
    });

    if (!targetLayer) return;

    map.flyToBounds(targetLayer.getBounds(), {
      padding: [40, 40],
      duration: 0.8,
    });
  }

  function focusCidade(cidade) {
    if (!map || !cidade) return;

    const pontos = $byBairro.filter((b) => b.cidade === cidade);

    if (pontos.length === 0) {
      const cidadeData = $byCidade.find((c) => c.cidade === cidade);

      if (cidadeData) {
        map.flyTo([cidadeData.lat, cidadeData.lng], 13, {
          duration: 0.8,
        });
      }

      return;
    }

    const bounds = L.latLngBounds(pontos.map((p) => [p.lat, p.lng]));

    map.flyToBounds(bounds, {
      padding: [40, 40],
      duration: 0.8,
      maxZoom: 15,
    });
  }

  // -------------------------
  // GEOJSON
  // -------------------------
  async function initGeojson() {
    geojsonData = await fetch(import.meta.env.BASE_URL + "data/brasil-estados.geojson").then((r) =>
      r.json(),
    );

    estadosLayer = L.geoJSON(geojsonData, {
      style: getEstadoStyle,
      onEachFeature: (feature, layer) => {
        const sigla = feature.properties.sigla;

        const clickable = hasData(sigla);

        if (clickable) {
          layer.on("click", () => {
            filters.update((f) => ({
              ...f,
              estado: sigla,
              cidade: null,
            }));

            viewMode.set("nacional");

            map.flyToBounds(layer.getBounds(), {
              padding: [40, 40],
              duration: 0.8,
            });

            updateEstadosStyle();
          });
        }
      },
    }).addTo(map);
  }

  // -------------------------
  // INIT
  // -------------------------
  onMount(() => {
    map = L.map(mapEl, {
      center: BRASIL_CENTER,
      zoom: BRASIL_ZOOM,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 16,
        minZoom: 3,
      },
    ).addTo(map);

    L.control
      .attribution({ position: "bottomright", prefix: "" })
      .addAttribution(
        '© <a href="https://carto.com">CARTO</a> © <a href="https://openstreetmap.org">OSM</a>',
      )
      .addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    initialized = true;

    initGeojson();
    renderNacional();
  });

  onDestroy(() => map?.remove());

  // -------------------------
  // REACTIVE CORE
  // -------------------------
  $: if (initialized) {
    updateEstadosStyle();

    if ($viewMode === "nacional") renderNacional();
    if ($viewMode === "cidade") renderCidade();
    if ($filters.estado) {
      focusEstado($filters.estado);
    }
    if ($filters.cidade) {
      focusCidade($filters.cidade);
    }
  }

  $: if (estadosLayer && $filters.estado !== undefined) {
    estadosLayer.eachLayer((layer) => {
      layer.setStyle(getEstadoStyle(layer.feature));

      const sigla = layer.feature.properties.sigla;
      if ($filters.estado === sigla) {
        layer.bringToFront();
      }
    });
  }
</script>

<div bind:this={mapEl} class="mapa" />

{#if $filters.estado && !$filters.cidade && $viewMode === "nacional" && $byCidade.length >= 1}
  <div class="map-hint">
    <strong>{$filters.estado}</strong>
    <span>
      Escolha uma cidade no painel para saber mais sobre as trançista deste
      estado.
    </span>
  </div>{/if}

<style>
  .mapa {
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  :global(.map-tooltip) {
    background: #1a0f0a;
    border: none;
    border-radius: 2px;
    color: #f5ece4;
    font-family: "DM Mono", monospace;
    font-size: 12px;
    padding: 6px 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  :global(.map-tooltip::before) {
    border-top-color: #1a0f0a !important;
  }

  :global(.count-label) {
    background: transparent;
    border: none;
  }

  :global(.estado-disabled) {
    cursor: default;
  }

  :global(.estado-clickable) {
    cursor: pointer;
  }

  :global(.estado-count div) {
    min-width: 28px;
    background: #c23b22;
    color: #f5ece4;
    border-radius: 999px;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
  }

  .map-hint {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 1000;
    background: rgba(26, 15, 10, 0.95);
    color: #f5ece4;
    border: 1px solid #3d2b1f;
    border-radius: 4px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    pointer-events: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .map-hint strong {
    font-family: "DM Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .map-hint span {
    font-family: "DM Mono", monospace;
    font-size: 12px;
    opacity: 0.85;
  }

  :global(.leaflet-control-attribution) {
    display: none;
  }
</style>

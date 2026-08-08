<script>
  import { onMount, onDestroy } from "svelte";
  import L from "leaflet";
  import { allStateFeatures, featureCentroid } from "../utils/geo.js";
  import { ESTADOS_BY_SIGLA } from "../data/estados.js";

  export let records = [];
  export let countsBySigla = new Map();
  export let onSelectEstado = () => {};

  let mapEl;
  let map;
  let geoLayer;
  let pointsLayer;
  let labelsLayer;

  function styleFor(sigla) {
    const has = (countsBySigla.get(sigla) || 0) > 0;
    return has
      ? {
          color: "#c1622f",
          weight: 1.2,
          fillColor: "#eba876",
          fillOpacity: 0.2,
        }
      : {
          color: "#cdbfa8",
          weight: 0.8,
          fillColor: "#e4d5ba",
          fillOpacity: 0.1,
        };
  }

  function draw() {
    if (geoLayer) geoLayer.remove();
    if (pointsLayer) pointsLayer.remove();
    if (labelsLayer) labelsLayer.remove();

    geoLayer = L.geoJSON(allStateFeatures(), {
      style: (feature) => styleFor(feature.properties.sigla),
      onEachFeature: (feature, layer) => {
        const sigla = feature.properties.sigla;
        const has = (countsBySigla.get(sigla) || 0) > 0;
        layer.bindTooltip(`${sigla} — ${ESTADOS_BY_SIGLA[sigla]?.nome || ""}`, {
          sticky: true,
          className: "map-tooltip",
        });
        if (has) {
          layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.32 }));
          layer.on("mouseout", () => layer.setStyle({ fillOpacity: 0.16 }));
          layer.on("click", () => onSelectEstado(sigla));
          layer.getElement()?.classList.add("clickable-state");
        }
      },
    }).addTo(map);

    pointsLayer = L.layerGroup(
      records
        .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon))
        .map((r) =>
          L.circleMarker([r.lat, r.lon], {
            radius: 1.6,
            color: "#c1622f",
            weight: 1,
            fillColor: "#db7b41",
            fillOpacity: 0,
            interactive: false,
          }),
        ),
    ).addTo(map);

    const labelMarkers = [];
    for (const feature of allStateFeatures()) {
      const sigla = feature.properties.sigla;
      const count = countsBySigla.get(sigla) || 0;
      if (!count) continue;
      const info = ESTADOS_BY_SIGLA[sigla];
      const [clat, clon] = featureCentroid(feature);
      let labelLat = clat,
        labelLon = clon;
      let leaderLine = null;
      if (info?.labelOffset) {
        const [dLon, dLat] = info.labelOffset;
        labelLat = clat + dLat;
        labelLon = clon + dLon;
        leaderLine = L.polyline(
          [
            [clat, clon],
            [labelLat, labelLon],
          ],
          { color: "#c1622f", weight: 1, dashArray: "2,2", interactive: false },
        );
        labelMarkers.push(leaderLine);
      }
      const icon = L.divIcon({
        className: "state-count-badge",
        html: `<span>${count}</span>`,
        iconSize: null,
      });
      labelMarkers.push(
        L.marker([labelLat, labelLon], { icon, interactive: false }),
      );
    }
    labelsLayer = L.layerGroup(labelMarkers).addTo(map);
  }

  onMount(() => {
    map = L.map(mapEl, {
      center: [-14.2, -51.9],
      zoom: 4,
      minZoom: 3.6,
      maxZoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(
      "https://www.alessandromusetta.com/geo/tiles/tranca/{z}/{x}/{y}.png",
      {
        minZoom: 3,
        maxZoom: 10,
        tileSize: 256,
        opacity: 0.65,
      },
    ).addTo(map);
  });

  onDestroy(() => {
    map?.remove();
  });

  $: if (map && records) draw();
</script>

<div class="map-wrap">
  <div class="map" bind:this={mapEl}></div>
</div>

<style>
  .map-wrap,
  .map {
    height: 100%;
    width: 100%;
  }
  .map {
    background: var(--areia-100);
  }
  :global(.state-count-badge span) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--cacau-800);
    color: var(--off-white);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 500;
    transform: translate(-50%, -50%);
    white-space: nowrap;
  }
  :global(.clickable-state) {
    cursor: pointer;
  }
  :global(.map-tooltip) {
    font-family: var(--font-body);
    font-size: 0.75rem;
  }
  :global(.leaflet-container) {
    font-family: var(--font-body);
  }
</style>

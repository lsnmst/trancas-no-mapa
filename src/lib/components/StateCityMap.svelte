<script>
  import { onMount, onDestroy } from "svelte";
  import L from "leaflet";
  import "leaflet.markercluster";
  import {
    getStateFeature,
    featureBounds,
    pointInFeature,
    boundsPad,
  } from "../utils/geo.js";

  export let estado;
  export let cidade = null; // string or null
  export let records = []; // already filtered by estado + selected anos

  let mapEl;
  let map;
  let clusterLayer;
  let outlineLayer;

  function cityBounds(cityRecords) {
    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity;
    for (const r of cityRecords) {
      if (r.lat < minLat) minLat = r.lat;
      if (r.lat > maxLat) maxLat = r.lat;
      if (r.lon < minLon) minLon = r.lon;
      if (r.lon > maxLon) maxLon = r.lon;
    }
    if (!Number.isFinite(minLat)) return null;
    if (minLat === maxLat && minLon === maxLon) {
      return [
        [minLat - 0.05, minLon - 0.05],
        [maxLat + 0.05, maxLon + 0.05],
      ];
    }
    return [
      [minLat, minLon],
      [maxLat, maxLon],
    ];
  }

  function draw() {
    if (clusterLayer) clusterLayer.remove();
    if (outlineLayer) outlineLayer.remove();

    const feature = getStateFeature(estado);

    outlineLayer = L.geoJSON(feature, {
      style: { color: "#c1622f", weight: 2, fill: false },
      interactive: false,
    }).addTo(map);

    clusterLayer = L.markerClusterGroup({
      maxClusterRadius: 34,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: "cluster-badge",
          iconSize: null,
        }),
    });

    const cityRecords = cidade
      ? records.filter((r) => r.cidade === cidade)
      : records;

    for (const r of cityRecords) {
      const inside = pointInFeature(r.lat, r.lon, feature);
      const dimmed = !inside;
      const marker = L.circleMarker([r.lat, r.lon], {
        radius: dimmed ? 4 : 5.5,
        color: dimmed ? "#b7a68c" : "#c1622f",
        weight: 1,
        fillColor: dimmed ? "#cdbfa8" : "#db7b41",
        fillOpacity: dimmed ? 0.4 : 0.85,
        interactive: false,
      });
      clusterLayer.addLayer(marker);
    }
    clusterLayer.addTo(map);
    map.invalidateSize();

    let bounds, boundsForLock, maxZoomBoost;
    if (cidade) {
      const cb = cityBounds(cityRecords);

      console.log("CITTÀ:", cidade);
      console.log("RECORD CITTÀ:", cityRecords.length);
      console.log("BOUNDS CITTÀ:", cb);

      bounds = cb || featureBounds(feature);
      boundsForLock = boundsPad(bounds, 0.6);
      maxZoomBoost = 3;
    } else {
      bounds = featureBounds(feature);
      boundsForLock = boundsPad(bounds, 0.15);
      maxZoomBoost = 4;
    }

    map.setMaxBounds(null);
    map.fitBounds(bounds, { padding: [24, 24] });
    const fittedZoom = map.getZoom();
    map.setMinZoom(fittedZoom);
    map.setMaxZoom(fittedZoom + maxZoomBoost);
    map.setMaxBounds(boundsForLock);
    map.options.maxBoundsViscosity = 0.8;
  }

  onMount(() => {
    map = L.map(mapEl, {
      zoomControl: true,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 12,
      maxBoundsViscosity: 0.8,
    });

    const trancaLayer = L.tileLayer(
      "https://www.alessandromusetta.com/geo/tiles/tranca/{z}/{x}/{y}.png",
      {
        minZoom: 3,
        maxZoom: 9,
        tileSize: 256,
        opacity: 0.8,
        keepBuffer: 2,
      },
    );

    const cartoLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        minZoom: 10,
        maxZoom: 18,
        tileSize: 256,
        opacity: 0,
        keepBuffer: 2,
        attribution: "Tiles © Esri",
      },
    );

    trancaLayer.addTo(map);
    cartoLayer.addTo(map);

    function updateBaseLayer() {
      const zoom = map.getZoom();

      if (zoom >= 10) {
        trancaLayer.setOpacity(0);
        cartoLayer.setOpacity(1);
      } else {
        trancaLayer.setOpacity(0.8);
        cartoLayer.setOpacity(0);
      }
    }

    updateBaseLayer();

    map.on("zoomend", updateBaseLayer);
  });

  onDestroy(() => {
    map?.remove();
  });

  $: if (map && estado && records) {
    cidade;
    draw();
  }
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
  :global(.cluster-badge span) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: rgba(219, 123, 65, 0.22);
    border: 1.6px solid #c1622f;
    color: #4f2f1e;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    transform: translate(-50%, -50%);
  }
</style>

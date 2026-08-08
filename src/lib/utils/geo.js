import statesGeo from "../data/brazil-states.geo.json";

const bySigla = new Map(statesGeo.features.map((f) => [f.properties.sigla, f]));

export function getStateFeature(sigla) {
  return bySigla.get(sigla) || null;
}

export function allStateFeatures() {
  return statesGeo.features;
}

/** [[south, west], [north, east]] bounding box for a GeoJSON feature. */
export function featureBounds(feature) {
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  const walk = (coords, depth) => {
    if (depth === 0) {
      const [lon, lat] = coords;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      return;
    }
    for (const c of coords) walk(c, depth - 1);
  };
  const depth = feature.geometry.type === "Polygon" ? 2 : 3;
  walk(feature.geometry.coordinates, depth);
  return [[minLat, minLon], [maxLat, maxLon]];
}

export function featureCentroid(feature) {
  const coords = feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0];

  let area = 0;
  let x = 0;
  let y = 0;

  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];

    const f = xi * yj - xj * yi;

    area += f;
    x += (xi + xj) * f;
    y += (yi + yj) * f;
  }

  area *= 0.5;

  if (!area) {
    return featureBounds(feature)
      .reduce((a) => a);
  }

  x /= 6 * area;
  y /= 6 * area;

  return [y, x];
}

function ringContains(ring, lon, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonContains(polygon, lon, lat) {
  // polygon = [outerRing, hole1, hole2, ...]
  if (!ringContains(polygon[0], lon, lat)) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (ringContains(polygon[i], lon, lat)) return false; // inside a hole
  }
  return true;
}

/** True if (lat, lon) falls inside the given state feature's geometry. */
export function pointInFeature(lat, lon, feature) {
  if (!feature) return false;
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") return polygonContains(coordinates, lon, lat);
  if (type === "MultiPolygon") {
    return coordinates.some((poly) => polygonContains(poly, lon, lat));
  }
  return false;
}

function boundsPad([[s, w], [n, e]], padFactor) {
  const dLat = (n - s) * padFactor || 0.5;
  const dLon = (e - w) * padFactor || 0.5;
  return [[s - dLat, w - dLon], [n + dLat, e + dLon]];
}

export { boundsPad };

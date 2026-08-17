const VALID_ESTADOS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]);

function boolFlags(raw, prefix) {
  const out = [];
  for (const key of Object.keys(raw)) {
    if (key.startsWith(prefix + "/")) {
      const val = String(raw[key]).trim();
      if (val === "1" || val.toLowerCase() === "true") {
        out.push(key.slice(prefix.length + 1));
      }
    }
  }
  return out;
}

const ONDE_MAP = {
  casa_de_clientes: "Casa de clientes",
  espa_o_coletivo_ou_comunit_rio: "Espaço coletivo ou comunitário",
  espa_o_separado_da_casa: "Espaço separado da casa",
  espa_o_adaptado_dentro_da_casa: "Espaço adaptado dentro da casa",
  espa_o_da_casa_sem_adapta_o_profissional:
    "Espaço da casa sem adaptação profissional",
  sal_o_fora_de_casa__afro: "Salão fora de casa (afro)",
  rua___centro_hist_rico: "Rua / centro histórico",
};

function normalizeOnde(values) {
  return values.map(v => ONDE_MAP[v] || v);
}

function parseCoords(raw) {
  // Kobo JSON exports typically carry `_geolocation: [lat, lon]`, but the
  // labels/CSV export (and some form versions) only has the free-text
  // `coordenadas` field ("lat lon alt acc").
  if (Array.isArray(raw._geolocation) && raw._geolocation.length === 2) {
    const [lat, lon] = raw._geolocation;
    if (typeof lat === "number" && typeof lon === "number") return { lat, lon };
  }
  const src = raw.coordenadas || raw._coordenadas || "";
  const parts = String(src).trim().split(/\s+/).map(Number);
  if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    return { lat: parts[0], lon: parts[1] };
  }
  return { lat: null, lon: null };
}

function buildImageUrls(raw, mediaProxyBase) {
  const attachments = raw._attachments || [];
  return attachments
    .filter((a) => (a.mimetype || "").startsWith("image/"))
    .map((a) => {
      const full = a.download_url || a.download_large_url;
      const small = a.download_small_url || a.download_medium_url || full;
      if (!mediaProxyBase) return { url: full, thumbUrl: small };
      return {
        url: `${mediaProxyBase}?url=${encodeURIComponent(full)}`,
        thumbUrl: `${mediaProxyBase}?url=${encodeURIComponent(small)}`,
      };
    });
}

/**
 * Normalize one raw Kobo submission (as returned by the /data/ endpoint)
 * into the flat shape used throughout the app. Returns null for rows that
 * can't be placed on the map (missing/invalid state or coordinates) so
 * callers can silently drop malformed submissions instead of crashing.
 */
function splitKoboValue(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(v => splitKoboValue(v));
  }

  return String(value)
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
}

function normalizeCidade(estado, cidade, bairro) {
  const cidadeValue = String(cidade || "").trim();
  const bairroValue = String(bairro || "").trim();

  if (estado === "DF") {
    if (bairroValue) return bairroValue;

    if (
      cidadeValue &&
      cidadeValue.toLowerCase() !== "brasilia" &&
      cidadeValue.toLowerCase() !== "brasília"
    ) {
      return cidadeValue;
    }

    return "Distrito Federal";
  }

  return cidadeValue;
}

export function parseKoboRecord(raw, { mediaProxyBase } = {}) {
  console.log("IMMAGINI KOBO", raw.ID, raw._attachments);
  const estado = String(raw.estado || "").trim().toUpperCase();
  const ano = String(raw.ano || "").trim();
  const { lat, lon } = parseCoords(raw);

  const bairro = String(raw.bairro || "").trim();

  if (!VALID_ESTADOS.has(estado)) return null;
  if (!["2021", "2023", "2026"].includes(ano)) return null;
  if (lat === null || lon === null || (lat === 0 && lon === 0)) return null;

  return {
    id: raw.ID || raw._id,
    uuid: raw._uuid,
    ano,
    estado,
    cidade: normalizeCidade(estado, raw.cidade, bairro),
    bairro: (raw.bairro || "").trim(),
    tipoArea: raw.tipo_area || null,
    comoAprendeu: splitKoboValue(
      boolFlags(raw, "como_aprendeu").length
        ? boolFlags(raw, "como_aprendeu")
        : raw.como_aprendeu
    ),
    idadeInicio: raw.idade_inicio || null,
    ensina: raw.ensina || null,
    paraQuem: boolFlags(raw, "para_quem"),
    geracoes: raw.geracoes || null,
    onde: splitKoboValue(
      boolFlags(raw, "onde").length
        ? boolFlags(raw, "onde")
        : raw.onde
    ),
    trabalhaEmCasa: raw.trabalha_em_casa || null,
    trabalhaFora: raw["  trabalha_fora"] || raw.trabalha_fora || null,
    itinerante: raw.itinerante || null,
    atendeNoTerritorio: raw.atende_no_territorio || null,
    rendaPrincipal: raw.renda_principal || null,
    temImagem: String(raw.tem_imagem || "").trim() === "sim",
    lat,
    lon,
    images: buildImageUrls(raw, mediaProxyBase),
  };
}

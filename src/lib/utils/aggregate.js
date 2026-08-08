import {
  ONDE_OPTIONS,
  COMO_APRENDEU_OPTIONS,
  GERACOES_OPTIONS,
  ENSINA_OPTIONS,
} from "./koboFields.js";

/** Filter records by selected years (empty/absent selection = all years). */
export function filterByAnos(records, anos) {
  if (!anos || anos.length === 0) return records;
  const set = new Set(anos);
  return records.filter((r) => set.has(r.ano));
}

export function countByEstado(records) {
  const counts = new Map();
  for (const r of records) {
    counts.set(r.estado, (counts.get(r.estado) || 0) + 1);
  }
  return counts;
}

export function recordsForEstado(records, sigla) {
  return records.filter((r) => r.estado === sigla);
}

export function recordsForCidade(records, sigla, cidade) {
  return records.filter((r) => r.estado === sigla && r.cidade === cidade);
}

export function citiesForEstado(records, sigla) {
  const counts = new Map();
  for (const r of records) {
    if (r.estado !== sigla || !r.cidade) continue;
    counts.set(r.cidade, (counts.get(r.cidade) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([cidade, count]) => ({ cidade, count }))
    .sort((a, b) => b.count - a.count || a.cidade.localeCompare(b.cidade, "pt-BR"));
}

function pct(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

/**
 * Build the three infographic groups shown in the state's right-hand
 * stats tab: gerações, como aprenderam (+ ensinam), onde trançam.
 * Each entry only counts records where the field was actually answered,
 * since the questionnaire differs across the 2021/2023/2026 editions.
 */
function parseMulti(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  return value
    .split(/\s+/)
    .filter(Boolean);
}

export function computeStats(records) {

  console.log("TOTAL RECORDS", records.length);

  console.log(
    "ESEMPIO COMO",
    records.find(r => r.como_aprendeu || r.comoAprendeu)
  );

  console.log(
    "ESEMPIO ONDE",
    records.find(r => r.onde)
  );

  const geracoesTotal = records.filter((r) => r.geracoes).length;
  const geracoes = GERACOES_OPTIONS.map(({ key, label }) => {
    const count = records.filter((r) => r.geracoes === key).length;
    return { label, count, pct: pct(count, geracoesTotal) };
  });

  const comoTotal = records.filter((r) => r.comoAprendeu?.length).length;
  const comoAprendeu = COMO_APRENDEU_OPTIONS
    .map(({ key, label }) => {
      const count = records.filter(
        (r) => r.comoAprendeu?.includes(key)
      ).length;

      return {
        label,
        count,
        pct: pct(count, comoTotal)
      };
    })
    .filter(item => item.count > 0);

  const ensinaTotal = records.filter((r) => r.ensina).length;
  const ensina = ENSINA_OPTIONS.map(({ key, label }) => {
    const count = records.filter((r) => r.ensina === key).length;
    return { label, count, pct: pct(count, ensinaTotal) };
  });

  const ondeTotal = records.filter(
    r => r.onde?.length
  ).length;

  const onde = ONDE_OPTIONS
    .map(({ key, label }) => {

      const count = records.filter(r =>
        r.onde?.includes(key)
      ).length;

      return {
        label,
        count,
        pct: pct(count, ondeTotal)
      };

    })
    .filter(item => item.count > 0);

  return {
    geracoes: { items: geracoes, total: geracoesTotal },
    comoAprendeu: {
      items: comoAprendeu, total: comoTotal, type: "multiple",
      label: "Percentual de pessoas"
    },
    ensina: { items: ensina, total: ensinaTotal },
    onde: { items: onde, total: ondeTotal },
  };
}

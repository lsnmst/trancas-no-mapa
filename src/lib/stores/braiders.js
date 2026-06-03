import { writable, derived } from 'svelte/store';

export const allBraiders = writable([]);

export const filters = writable({
  years: [],
  estado: null,
  cidade: null,
  tipoArea: null,
  comoAprendeu: null,
  ensina: null,
  renda: null,
});

export const viewMode = writable('nacional'); // 'nacional' | 'cidade'

export const filtered = derived([allBraiders, filters], ([$all, $f]) =>
  $all.filter(b => {
    if ($f.years.length && !$f.years.includes(b.ano)) return false;
    if ($f.estado && b.estado !== $f.estado) return false;
    if ($f.tipoArea && b.tipoArea !== $f.tipoArea) return false;
    if ($f.comoAprendeu && b.comoAprendeu !== $f.comoAprendeu) return false;
    if ($f.ensina != null && b.ensina !== $f.ensina) return false;
    if ($f.renda != null && b.renda !== $f.renda) return false;
    return true;
  })
);

// Cities under current estado filter
export const byEstado = derived(filtered, $f => {
  const acc = {};

  $f.forEach(b => {
    if (!acc[b.estado]) {
      acc[b.estado] = {
        estado: b.estado,
        count: 0
      };
    }
    acc[b.estado].count++;
  });

  return Object.values(acc);
});

// Cities under current estado filter
export const citiesInEstado = derived([filtered, filters], ([$f, $fil]) => {
  if (!$fil.estado) return [];
  const map = {};
  $f.filter(b => b.estado === $fil.estado).forEach(b => {
    if (!map[b.cidade]) map[b.cidade] = 0;
    map[b.cidade]++;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

// Per-city aggregate for nacional view
export const byCidade = derived(filtered, $f => {
  const acc = {};
  $f.forEach(b => {
    if (!acc[b.cidade]) acc[b.cidade] = { cidade: b.cidade, estado: b.estado, lat: b.lat, lng: b.lng, count: 0 };
    acc[b.cidade].count++;
  });
  return Object.values(acc);
});

export const visibleCities = derived(
  [allBraiders, filters],
  ([$all, $filters]) => {
    const acc = {};

    $all.forEach((b) => {
      if (!acc[b.cidade]) {
        acc[b.cidade] = {
          cidade: b.cidade,
          estado: b.estado,
          lat: b.lat,
          lng: b.lng,
          count: 0,
        };
      }

      acc[b.cidade].count++;
    });

    return Object.values(acc);
  }
);

// Per-bairro aggregate for city zoom view
export const byBairro = derived([filtered, filters], ([$f, $fil]) => {
  if (!$fil.cidade) return [];
  const acc = {};
  $f.filter(b => b.cidade === $fil.cidade).forEach(b => {
    const key = b.bairro || '(sem bairro)';
    if (!acc[key]) {
      // use a slight jitter so overlapping coords spread out
      const jitter = () => (Math.random() - 0.5) * 0.004;
      acc[key] = { bairro: key, lat: b.lat + jitter(), lng: b.lng + jitter(), count: 0 };
    }
    acc[key].count++;
  });
  return Object.values(acc);
});

// Braiders with images in current cidade
export const imagesInCidade = derived([filtered, filters], ([$f, $fil]) => {
  if (!$fil.cidade) return [];
  return $f.filter(b => b.cidade === $fil.cidade && b.temImagem && b.linkImagem);
});

// Unique dropdown values from full dataset
export const uniqueValues = derived(allBraiders, $all => ({
  anos: [...new Set($all.map(b => b.ano))].filter(Boolean).sort(),
  estados: [...new Set($all.map(b => b.estado))].filter(Boolean).sort(),
  tiposArea: [...new Set($all.map(b => b.tipoArea))].filter(Boolean).sort(),
  aprendizados: [...new Set($all.map(b => b.comoAprendeu))].filter(Boolean).sort(),
}));

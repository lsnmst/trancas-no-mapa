import Papa from 'papaparse';

export async function loadBraiders() {
  const res = await fetch(import.meta.env.BASE_URL + 'trancadoras.csv');
  const text = await res.text();

  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().replace(/\n/g, '').replace(/\r/g, ''),
  });

  return data
    .map((row, i) => {
      const lat = parseFloat(row['latitude']?.trim().replace(/\n/g,'').replace(/\r/g,''));
      const lng = parseFloat(row['longitude']?.trim().replace(/\n/g,'').replace(/\r/g,''));
      return {
        id:           row.id || i,
        ano:          Number(row.ano),
        estado:       row.estado?.trim() || null,
        cidade:       row.cidade?.trim() || null,
        bairro:       row.bairro?.trim() || null,
        tipoArea:     row.tipo_area?.trim() || null,
        comoAprendeu: row.como_aprendeu?.trim() || null,
        idadeInicio:  row.idade_inicio?.trim() || null,
        ensina:       row.ensina?.trim().toLowerCase() === 'sim',
        paraQuem:     row.para_quem?.trim() || null,
        geracoes:     row.geracoes?.trim() || null,
        trabalhaEmCasa: row.trabalha_em_casa?.trim().toLowerCase() === 'sim',
        trabalhaFora:   row.trabalha_fora?.trim().toLowerCase() === 'sim',
        itinerante:     row.itinerante?.trim().toLowerCase() === 'sim',
        atendeTerritorio: row.atende_no_territorio?.trim().toLowerCase() === 'sim',
        renda:        row['Trançar é sua principal renda?']?.trim().toLowerCase() === 'sim',
        temImagem:    row.tem_imagem?.trim().toLowerCase() === 'sim',
        linkImagem:   row.link_imagem?.trim() || null,
        lat,
        lng,
      };
    })
    .filter(b => !isNaN(b.lat) && !isNaN(b.lng) && b.estado);
}

// Reference table for the 26 states + Distrito Federal.
// `labelOffset` nudges the point-count badge away from the state's
// centroid for states whose shape is too small to hold a 2-3 digit
// number legibly (this was the open question on the mockup: "Distrito
// Federal com número a três cifras. Como resolver?"). The badge is
// drawn at centroid + offset and connected back with a thin leader line.
export const ESTADOS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas", labelOffset: [0.2, -0.2] },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal", labelOffset: [0, 1.1] },
  { sigla: "ES", nome: "Espírito Santo", labelOffset: [1.6, 0.2] },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba", labelOffset: [0.3, -0.3] },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco"},
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro", labelOffset: [1.6, -0.3] },
  { sigla: "RN", nome: "Rio Grande do Norte"},
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina", labelOffset: [0.2, -0.2] },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe"},
  { sigla: "TO", nome: "Tocantins" },
];

export const ESTADOS_BY_SIGLA = Object.fromEntries(
  ESTADOS.map((e) => [e.sigla, e]),
);

export function estadoNome(sigla) {
  return ESTADOS_BY_SIGLA[sigla]?.nome || sigla;
}

export function slugify(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Group/multi-select field prefixes as they appear in the Kobo form
// (both in the "labels" CSV export and in the raw JSON API export).
export const MULTI_SELECT_FIELDS = {
  onde: "onde",
  comoAprendeu: "como_aprendeu",
  paraQuem: "para_quem",
};

// Canonical order + labels for the "onde trançam" categories, matching
// the mockup's infographic list.
export const ONDE_OPTIONS = [
  {
    key: "casa_de_clientes",
    label: "Casa de clientes",
  },
  {
    key: "espa_o_coletivo_ou_comunit_rio",
    label: "Espaço coletivo ou comunitário",
  },
  {
    key: "espa_o_separado_da_casa",
    label: "Espaço separado da casa",
  },
  {
    key: "espa_o_adaptado_dentro_da_casa",
    label: "Espaço adaptado dentro da casa",
  },
  {
    key: "espa_o_da_casa_sem_adapta_o_profissional",
    label: "Espaço da casa sem adaptação profissional",
  },
  {
    key: "sal_o_fora_de_casa__afro",
    label: "Salão fora de casa (afro)",
  },
  {
    key: "rua___centro_hist_rico",
    label: "Rua / centro histórico",
  },
];

export const COMO_APRENDEU_OPTIONS = [
  { key: "autodidata", label: "Autodidata" },
  { key: "curso", label: "Curso" },
  { key: "comunidade", label: "Comunidade" },
  { key: "familia", label: "Família" },
];

export const GERACOES_OPTIONS = [
  { key: "1", label: "Primeira" },
  { key: "2", label: "Segunda" },
  { key: "3", label: "Terceira" },
];

export const ENSINA_OPTIONS = [
  { key: "sim", label: "Sim" },
  { key: "nao", label: "Não" },
];

export const ANOS = ["2021", "2023", "2026"];

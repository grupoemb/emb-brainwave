export type ItemBiblioteca = {
  id: string;
  source: string;
  creator_handle: string | null;
  niche: string | null;
  url: string | null;
  format: string | null;
  headline: string | null;
  hook_text: string | null;
  hook_type: string | null;
  theme: string | null;
  intent: string | null;
  duration_s: number | null;
  views: number | null;
  vx: number | null;
  likes: number | null;
  comments: number | null;
  cover_url: string | null;
  analysis: Record<string, unknown> | null;
  note: string | null;
  tags: string[] | null;
  status: string;
  created_at: string;
};

export type LinhaInsight = {
  rotulo: string;
  n: number;
  vx_medio: number | null;
};

export type InsightsBiblioteca = {
  total: number;
  porGancho: LinhaInsight[];
  porDuracao: LinhaInsight[];
  porNicho: LinhaInsight[];
};

export const LIMITE_VX_BOM = 1.3;
export const LIMITE_VX_FLAME = 2;

export const FAIXAS_DURACAO = [
  { valor: "", rotulo: "—", segundos: null },
  { valor: "0-15s", rotulo: "0-15s", segundos: 10 },
  { valor: "16-30s", rotulo: "16-30s", segundos: 22 },
  { valor: "31-60s", rotulo: "31-60s", segundos: 45 },
  { valor: "60s+", rotulo: "60s+", segundos: 75 },
] as const;

export function faixaDuracao(s: number | null) {
  if (s === null || !Number.isFinite(s)) return "—";
  if (s <= 15) return "0-15s";
  if (s <= 30) return "16-30s";
  if (s <= 60) return "31-60s";
  return "60s+";
}

export const ROTULO_GANCHO: Record<string, string> = {
  question: "Pergunta",
  bold_claim: "Afirmação forte",
  story: "História",
  stat: "Dado",
  contrarian: "Contraponto",
  list: "Lista",
  news: "Notícia",
  how_to: "Passo a passo",
  other: "Outro",
};

function linhas(bruto: unknown, chave: string): LinhaInsight[] {
  if (!Array.isArray(bruto)) return [];
  return bruto
    .map((l) => {
      const o = (l ?? {}) as Record<string, unknown>;
      const rotuloBruto = o[chave];
      const rotulo = typeof rotuloBruto === "string" && rotuloBruto ? rotuloBruto : "—";
      const vx = o["vx_medio"];
      return {
        rotulo: ROTULO_GANCHO[rotulo] ?? rotulo,
        n: Number(o["n"] ?? 0),
        vx_medio: vx === null || vx === undefined ? null : Number(vx),
      };
    })
    .filter((l) => l.n > 0);
}

export function normalizarInsights(bruto: unknown): InsightsBiblioteca {
  const o = (bruto ?? {}) as Record<string, unknown>;
  return {
    total: Number(o["total"] ?? 0),
    porGancho: linhas(o["por_gancho"], "hook_type"),
    porDuracao: linhas(o["por_duracao"], "faixa_duracao"),
    porNicho: linhas(o["por_nicho"], "niche"),
  };
}

/** Texto de análise vindo do jsonb `analysis`, tolerante a chaves ausentes. */
export function lerAnalise(analysis: Record<string, unknown> | null) {
  const o = analysis ?? {};
  const texto = (chave: string) => {
    const v = o[chave];
    if (typeof v === "string") return v.trim() || null;
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string").join("\n");
    return null;
  };
  return {
    pendente: o["status"] === "analise_pendente",
    mechanics: texto("mechanics"),
    why_it_works: texto("why_it_works"),
    reproduction_recipe: texto("reproduction_recipe"),
  };
}

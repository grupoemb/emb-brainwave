import { Bookmark, MessageCircle, Share2, type LucideIcon } from "lucide-react";

export type ReelRanking = {
  handle: string;
  id: string;
  url: string | null;
  caption: string | null;
  published_at: string | null;
  plays: number | null;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  comments: number | null;
  likes: number | null;
  reach_rate: number | null;
  shares_pr: number | null;
  saves_pr: number | null;
  eng_pr: number | null;
  vx: number | null;
  score: number | null;
  lever: string | null;
  lever_pct: number | null;
  hook: string | null;
  theme: string | null;
  intent: string | null;
  rank_geral: number | null;
  rank_perfil: number | null;
  watch_s: number | null;
  hook_pct: number | null;
};


export type Alavanca = {
  rotulo: string;
  icone: LucideIcon;
  cor: string;
  metrica: (r: ReelRanking) => string;
};

const n = (v: number | null) => (v === null || !Number.isFinite(v) ? 0 : v);

export const LEVERS: Record<string, Alavanca> = {
  distribuicao: {
    rotulo: "Distribuição",
    icone: Share2,
    cor: "#00a4ff",
    metrica: (r) => `${n(r.shares)} compart · ${n(r.shares_pr).toFixed(1)}%`,
  },
  valor: {
    rotulo: "Valor",
    icone: Bookmark,
    cor: "#3ecf8e",
    metrica: (r) => `${n(r.saves)} salv · ${n(r.saves_pr).toFixed(1)}%`,
  },
  ressonancia: {
    rotulo: "Ressonância",
    icone: MessageCircle,
    cor: "#b06cff",
    metrica: (r) => `${n(r.comments)} coment`,
  },
};

export function alavancaDe(lever: string | null): Alavanca | null {
  if (!lever) return null;
  return LEVERS[lever] ?? null;
}

export const ROTULO_GANCHO: Record<string, string> = {
  news: "Notícia",
  question: "Pergunta",
  stat: "Dado",
  bold_claim: "Afirmação",
  contrarian: "Contraponto",
  story: "História",
  list: "Lista",
  how_to: "Passo a passo",
  other: "Outro",
};

export const ROTULO_INTENCAO: Record<string, string> = {
  news: "Notícia",
  education: "Educação",
  sales: "Venda",
  humor: "Humor",
  story: "História",
  inspiration: "Inspiração",
};

export function rotuloGancho(v: string | null) {
  if (!v) return "—";
  return ROTULO_GANCHO[v] ?? v;
}

export function rotuloIntencao(v: string | null) {
  if (!v) return "—";
  return ROTULO_INTENCAO[v] ?? v;
}

/** Valor mais frequente de uma lista (ignora nulos). */
export function moda(valores: (string | null)[]): string | null {
  const contagem = new Map<string, number>();
  for (const v of valores) {
    if (!v) continue;
    contagem.set(v, (contagem.get(v) ?? 0) + 1);
  }
  let melhor: string | null = null;
  let max = 0;
  for (const [k, c] of contagem) {
    if (c > max) {
      max = c;
      melhor = k;
    }
  }
  return melhor;
}

export function topGeral(reels: ReelRanking[], limite = 10) {
  return reels
    .filter((r) => r.rank_geral !== null && r.rank_geral <= limite)
    .sort((a, b) => (a.rank_geral ?? 99) - (b.rank_geral ?? 99));
}

/** Agrupa por handle, mantendo os N melhores por rank_perfil. */
export function topPorPerfil(reels: ReelRanking[], limite = 3) {
  const grupos = new Map<string, ReelRanking[]>();
  for (const r of reels) {
    const lista = grupos.get(r.handle) ?? [];
    lista.push(r);
    grupos.set(r.handle, lista);
  }
  return [...grupos.entries()]
    .map(([handle, lista]) => ({
      handle,
      reels: lista
        .slice()
        .sort((a, b) => (a.rank_perfil ?? 999) - (b.rank_perfil ?? 999))
        .slice(0, limite),
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

export type Inteligencia = {
  alavanca: string | null;
  gancho: string | null;
  intencao: string | null;
  frase: string | null;
};

/** Leitura templated (sem IA) sobre os top 10. */
export function inteligenciaRapida(reels: ReelRanking[]): Inteligencia {
  const top = topGeral(reels, 10);
  const alavanca = moda(top.map((r) => r.lever));
  const gancho = moda(top.map((r) => r.hook));
  const intencao = moda(top.map((r) => r.intent));

  const frase =
    top.length === 0
      ? null
      : `Seus campeões são ${rotuloIntencao(intencao).toLowerCase()} com gancho ${rotuloGancho(
          gancho,
        ).toLowerCase()}, que vencem por ${(alavancaDe(alavanca)?.rotulo ?? "—").toLowerCase()}.`;

  return { alavanca, gancho, intencao, frase };
}

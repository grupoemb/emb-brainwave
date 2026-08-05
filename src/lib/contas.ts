/** Visão de uma conta própria vinda de accounts_overview. */
export type ContaVisao = {
  handle: string;
  followers: number | null;
  reels: number;
  avgViews: number | null;
  medianViews: number | null;
  avgReach: number | null;
  avgSaves: number | null;
  engPct: number | null;
  bestTitle: string | null;
  bestViews: number | null;
  bestVx: number | null;
};

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Normaliza o array bruto do rpc accounts_overview. */
export function normalizarContas(bruto: unknown): ContaVisao[] {
  const lista = Array.isArray(bruto) ? bruto : [];
  return lista
    .map((c) => {
      const o = (c ?? {}) as Record<string, unknown>;
      return {
        handle: (texto(o["handle"]) ?? "").replace(/^@/, ""),
        followers: num(o["followers"]),
        reels: num(o["reels"]) ?? 0,
        avgViews: num(o["avg_views"]),
        medianViews: num(o["median_views"]),
        avgReach: num(o["avg_reach"]),
        avgSaves: num(o["avg_saves"]),
        engPct: num(o["eng_pct"]),
        bestTitle: texto(o["best_title"]),
        bestViews: num(o["best_views"]),
        bestVx: num(o["best_vx"]),
      } satisfies ContaVisao;
    })
    .filter((c) => c.handle && c.reels > 0);
}

/** Número compacto em pt-BR: 8.420 → 8,4 mil · 1.240.000 → 1,2 mi. */
export function compacto(v: number | null): string {
  if (v === null) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (abs >= 1_000) return `${(v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

/** "há 3 h", "há 2 dias" — frescor aproximado da última coleta. */
export function haQuantoTempo(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  const min = Math.max(0, Math.round((Date.now() - t) / 60_000));
  if (min < 2) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 36) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} dias`;
  const m = Math.round(d / 30);
  return `${m} ${m === 1 ? "mês" : "meses"}`;
}

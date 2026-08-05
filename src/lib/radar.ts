import { LIMITE_VX_BOM, LIMITE_VX_FLAME } from "@/lib/biblioteca";

export type ReelColetado = {
  id: string;
  url: string | null;
  views: number | null;
  vx: number | null;
  likes: number | null;
  comments: number | null;
  reach: number | null;
  saves: number | null;
  duration_s: number | null;
  cover: string | null;
  caption: string | null;
};

export type RespostaScan = {
  handle: string;
  count: number;
  median: number | null;
  source: string | null;
  reels: ReelColetado[];
};


function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

/** Normaliza o retorno bruto da Edge Function radar_scan. */
export function normalizarScan(bruto: unknown): RespostaScan {
  const o = (bruto ?? {}) as Record<string, unknown>;
  const brutos = Array.isArray(o["reels"]) ? (o["reels"] as unknown[]) : [];

  const reels: ReelColetado[] = brutos.map((r, i) => {
    const x = (r ?? {}) as Record<string, unknown>;
    return {
      id: texto(x["id"]) ?? texto(x["url"]) ?? `reel-${i}`,
      url: texto(x["url"]),
      views: num(x["views"]),
      vx: num(x["vx"]),
      likes: num(x["likes"]),
      comments: num(x["comments"]),
      reach: num(x["reach"]),
      saves: num(x["saves"]),
      duration_s: num(x["duration_s"]),
      cover: texto(x["cover"]),
      caption: texto(x["caption"]),
    };
  });

  return {
    handle: (texto(o["handle"]) ?? "perfil").replace(/^@/, ""),
    count: num(o["count"]) ?? reels.length,
    median: num(o["median"]),
    source: texto(o["source"]),
    reels,
  };

}

/** Classe da pill de vx: verde ≥1.3, neutra 0.7–1.3, coral <0.7. */
export function classeVx(vx: number | null) {
  if (vx === null) return "text-muted";
  if (vx >= LIMITE_VX_BOM) return "pill-bom";
  if (vx < 0.7) return "pill-ruim";
  return "pill-alerta";
}

export function ehVxFlame(vx: number | null) {
  return vx !== null && vx >= LIMITE_VX_FLAME;
}

/** Segundos em "0:59". */
export function formatarDuracao(s: number | null) {
  if (s === null || !Number.isFinite(s) || s < 0) return "—";
  const total = Math.round(s);
  const m = Math.floor(total / 60);
  return `${m}:${String(total % 60).padStart(2, "0")}`;
}

/** Extrai o @handle de uma URL de perfil, só para o texto de carregando. */
export function handleDaUrl(url: string) {
  const limpo = url.trim().replace(/\/+$/, "");
  const m = limpo.match(/instagram\.com\/([^/?#]+)/i);
  const h = m?.[1] ?? limpo.split("/").pop() ?? limpo;
  return h.replace(/^@/, "") || "perfil";
}

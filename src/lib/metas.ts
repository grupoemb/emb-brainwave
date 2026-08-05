import {
  BarChart3,
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Send,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { compacto, numero } from "@/lib/metricas";

export type MetricaMeta =
  | "followers"
  | "reach"
  | "impressions"
  | "interactions"
  | "saves"
  | "shares"
  | "comments"
  | "posts";

export type ModoMeta = "accumulate" | "increase" | "absolute";

export type StatusMeta = "adiantado" | "no_ritmo" | "atrasado" | "batido" | "encerrado";

export type PontoMeta = { d: string; prog: number; pace: number };
export type SemanaMeta = { semana: string; valor: number };

export type Meta = {
  id: string;
  label: string | null;
  metric: MetricaMeta;
  handle: string | null;
  mode: ModoMeta;
  target: number;
  effective_target: number;
  start_date: string;
  end_date: string;
  today: string;
  total_days: number;
  elapsed_days: number;
  days_left: number;
  baseline: number;
  current: number;
  progress: number;
  pct: number;
  pace_expected: number;
  ahead: number;
  run_rate: number;
  projected: number;
  projected_pct: number;
  required_run_rate: number;
  eta: string | null;
  status: StatusMeta;
  serie: PontoMeta[];
  buckets: SemanaMeta[];
};

export const METRICAS: {
  valor: MetricaMeta;
  rotulo: string;
  icone: LucideIcon;
  cor: string;
  exemploAlvo: string;
}[] = [
  { valor: "followers", rotulo: "Seguidores", icone: Users, cor: "#3ecf8e", exemploAlvo: "5000" },
  { valor: "reach", rotulo: "Alcance", icone: Eye, cor: "#00a4ff", exemploAlvo: "1000000" },
  {
    valor: "impressions",
    rotulo: "Impressões",
    icone: BarChart3,
    cor: "#00e7ff",
    exemploAlvo: "1500000",
  },
  {
    valor: "interactions",
    rotulo: "Interações",
    icone: Heart,
    cor: "#ff7a6b",
    exemploAlvo: "50000",
  },
  { valor: "saves", rotulo: "Salvamentos", icone: Bookmark, cor: "#b06cff", exemploAlvo: "10000" },
  {
    valor: "shares",
    rotulo: "Compartilhamentos",
    icone: Send,
    cor: "#f6bd24",
    exemploAlvo: "8000",
  },
  {
    valor: "comments",
    rotulo: "Comentários",
    icone: MessageCircle,
    cor: "#66c7ff",
    exemploAlvo: "3000",
  },
  { valor: "posts", rotulo: "Posts", icone: Zap, cor: "#8294ab", exemploAlvo: "40" },
];

export function infoMetrica(m: MetricaMeta) {
  return METRICAS.find((x) => x.valor === m) ?? METRICAS[1]!;
}

export const STATUS: Record<StatusMeta, { rotulo: string; cor: string; classe: string }> = {
  batido: { rotulo: "batido", cor: "#3ecf8e", classe: "pill pill-bom" },
  adiantado: { rotulo: "adiantado", cor: "#3ecf8e", classe: "pill pill-bom" },
  no_ritmo: { rotulo: "no ritmo", cor: "#00a4ff", classe: "pill bg-azure/14 text-azureClaro" },
  atrasado: { rotulo: "atrasado", cor: "#ff7a6b", classe: "pill pill-ruim" },
  encerrado: { rotulo: "encerrado", cor: "#8294ab", classe: "pill bg-white/6 text-muted" },
};

export const ORDEM_STATUS: StatusMeta[] = [
  "batido",
  "adiantado",
  "no_ritmo",
  "atrasado",
  "encerrado",
];

export const MODOS: { valor: ModoMeta; rotulo: string; ajuda: string }[] = [
  { valor: "increase", rotulo: "Ganhar N novos", ajuda: "O alvo é o ganho líquido no período." },
  { valor: "absolute", rotulo: "Chegar a N no total", ajuda: "O alvo é o nível final da conta." },
  { valor: "accumulate", rotulo: "Somar N no período", ajuda: "O alvo soma o período inteiro." },
];

/** Título do card: rótulo do gestor ou algo legível a partir da métrica e do escopo. */
export function tituloMeta(m: Meta) {
  if (m.label?.trim()) return m.label.trim();
  const base = infoMetrica(m.metric).rotulo;
  return m.handle ? `${base} — @${m.handle}` : base;
}

export function rotuloEscopo(handle: string | null) {
  return handle ? `@${handle}` : "Todas as contas";
}

/** "17,5 mil/dia" — ritmo sempre compacto e em pt-BR. */
export function ritmo(v: number | null) {
  if (v === null || !Number.isFinite(v)) return "—";
  if (Math.abs(v) < 10) return `${numero(v, 1)}/dia`;
  return `${compacto(Math.round(v))}/dia`;
}

export function percentual(frac: number | null) {
  if (frac === null || !Number.isFinite(frac)) return "—";
  return `${numero(frac * 100, frac < 0.1 ? 1 : 0)}%`;
}

/** "05/08" a partir de uma data ISO (yyyy-mm-dd), sem sofrer fuso. */
export function dataCurta(iso: string | null) {
  if (!iso) return "—";
  const [, m, d] = iso.slice(0, 10).split("-");
  return d && m ? `${d}/${m}` : "—";
}

function n(v: unknown, padrao = 0) {
  const x = typeof v === "string" ? Number(v) : v;
  return typeof x === "number" && Number.isFinite(x) ? x : padrao;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

/** Normaliza o jsonb devolvido por goals_overview para o tipo Meta. */
export function normalizarMetas(bruto: unknown): Meta[] {
  if (!Array.isArray(bruto)) return [];
  return bruto.map((item) => {
    const g = (item ?? {}) as Record<string, unknown>;
    const serie = Array.isArray(g["serie"]) ? (g["serie"] as Record<string, unknown>[]) : [];
    const buckets = Array.isArray(g["buckets"]) ? (g["buckets"] as Record<string, unknown>[]) : [];
    return {
      id: String(g["id"] ?? ""),
      label: texto(g["label"]),
      metric: (texto(g["metric"]) ?? "reach") as MetricaMeta,
      handle: texto(g["handle"]),
      mode: (texto(g["mode"]) ?? "accumulate") as ModoMeta,
      target: n(g["target"]),
      effective_target: n(g["effective_target"]),
      start_date: String(g["start_date"] ?? ""),
      end_date: String(g["end_date"] ?? ""),
      today: String(g["today"] ?? ""),
      total_days: n(g["total_days"], 1),
      elapsed_days: n(g["elapsed_days"]),
      days_left: n(g["days_left"]),
      baseline: n(g["baseline"]),
      current: n(g["current"]),
      progress: n(g["progress"]),
      pct: n(g["pct"]),
      pace_expected: n(g["pace_expected"]),
      ahead: n(g["ahead"]),
      run_rate: n(g["run_rate"]),
      projected: n(g["projected"]),
      projected_pct: n(g["projected_pct"]),
      required_run_rate: n(g["required_run_rate"]),
      eta: texto(g["eta"]),
      status: (texto(g["status"]) ?? "no_ritmo") as StatusMeta,
      serie: serie.map((p) => ({
        d: String(p["d"] ?? ""),
        prog: n(p["prog"]),
        pace: n(p["pace"]),
      })),
      buckets: buckets.map((b) => ({
        semana: String(b["semana"] ?? ""),
        valor: n(b["valor"]),
      })),
    } satisfies Meta;
  });
}

/** Atalhos de período do dialog. */
export function periodoAtalho(tipo: "mes" | "30d" | "trimestre") {
  const hoje = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (tipo === "mes") {
    const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    return { inicio: iso(ini), fim: iso(fim) };
  }
  if (tipo === "30d") {
    const fim = new Date(hoje);
    fim.setDate(fim.getDate() + 30);
    return { inicio: iso(hoje), fim: iso(fim) };
  }
  const t = Math.floor(hoje.getMonth() / 3);
  return {
    inicio: iso(new Date(hoje.getFullYear(), t * 3, 1)),
    fim: iso(new Date(hoje.getFullYear(), t * 3 + 3, 0)),
  };
}

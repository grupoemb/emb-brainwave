import type { Formato } from "@/lib/conteudo";
import { FORMATOS } from "@/lib/conteudo";

export type Leitura = {
  post_id: string;
  captured_at: string;
  reach: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
};

export type PostBruto = {
  id: string;
  title: string;
  channel: string | null;
  format: string | null;
  pillar_id: string | null;
  published_at: string | null;
  source_handle: string | null;
};

export type Baseline = {
  channel: string;
  format: string;
  metric: string;
  median_value: number | null;
};

export type LinhaMetrica = {
  id: string;
  title: string;
  conta: string | null;
  format: Formato | null;
  published_at: string | null;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  comments: number | null;
  likes: number | null;
  rx: number | null;
};

export const PALETA = ["#00a4ff", "#00e7ff", "#3ecf8e", "#f6bd24", "#a78bfa", "#ff7a6b"];

/** Limiares fixos de performance relativa. */
export function classeRx(rx: number | null) {
  if (rx === null) return "";
  if (rx >= 1.3) return "pill-bom";
  if (rx < 0.7) return "pill-ruim";
  return "";
}

export function rotuloFormato(f: string | null) {
  return FORMATOS.find((x) => x.valor === f)?.rotulo ?? "—";
}

export function numero(v: number | null, casas = 0) {
  if (v === null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** Deduplica leituras por post_id mantendo a mais recente (lista vem em captured_at desc). */
export function ultimaLeituraPorPost(leituras: Leitura[]) {
  const mapa = new Map<string, Leitura>();
  for (const l of leituras) {
    const atual = mapa.get(l.post_id);
    if (!atual || new Date(l.captured_at) > new Date(atual.captured_at)) mapa.set(l.post_id, l);
  }
  return mapa;
}

export function ultimaColeta(leituras: Leitura[]) {
  let max: number | null = null;
  for (const l of leituras) {
    const t = new Date(l.captured_at).getTime();
    if (max === null || t > max) max = t;
  }
  return max;
}

function medianaReach(baselines: Baseline[], channel: string | null, format: string | null) {
  if (!channel || !format) return null;
  const b = baselines.find(
    (x) => x.channel === channel && x.format === format && x.metric === "reach",
  );
  return b?.median_value && b.median_value > 0 ? b.median_value : null;
}

export function montarLinhas(
  posts: PostBruto[],
  leituras: Leitura[],
  baselines: Baseline[],
): LinhaMetrica[] {
  const ultimas = ultimaLeituraPorPost(leituras);
  return posts.map((p) => {
    const l = ultimas.get(p.id) ?? null;
    const mediana = medianaReach(baselines, p.channel, p.format);
    const reach = l?.reach ?? null;
    return {
      id: p.id,
      title: p.title,
      conta: p.source_handle,
      format: (p.format ?? null) as Formato | null,
      published_at: p.published_at,
      reach,
      saves: l?.saves ?? null,
      shares: l?.shares ?? null,
      comments: l?.comments ?? null,
      likes: l?.likes ?? null,
      rx: reach !== null && mediana !== null ? Number((reach / mediana).toFixed(2)) : null,
    };
  });
}

function soma(linhas: LinhaMetrica[], campo: keyof LinhaMetrica) {
  let total = 0;
  let tem = false;
  for (const l of linhas) {
    const v = l[campo];
    if (typeof v === "number") {
      total += v;
      tem = true;
    }
  }
  return tem ? total : null;
}

function horaSaoPaulo(iso: string) {
  const f = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    hour12: false,
  });
  return Number(f.format(new Date(iso)));
}

export function calcularKpis(linhas: LinhaMetrica[]) {
  const alcance = soma(linhas, "reach");
  const saves = soma(linhas, "saves");
  const shares = soma(linhas, "shares");
  const comments = soma(linhas, "comments");
  const likes = soma(linhas, "likes");

  const interacoes =
    likes === null && comments === null && saves === null && shares === null
      ? null
      : (likes ?? 0) + (comments ?? 0) + (saves ?? 0) + (shares ?? 0);

  const engajamento =
    alcance && alcance > 0 && interacoes !== null ? (interacoes / alcance) * 100 : null;

  const comRx = linhas.filter((l) => l.rx !== null);
  const rxMedio = comRx.length
    ? Number((comRx.reduce((s, l) => s + (l.rx as number), 0) / comRx.length).toFixed(2))
    : null;

  // melhor formato: maior rx médio, mínimo 3 posts
  const porFormato = new Map<string, number[]>();
  for (const l of comRx) {
    if (!l.format) continue;
    porFormato.set(l.format, [...(porFormato.get(l.format) ?? []), l.rx as number]);
  }
  let melhorFormato: { rotulo: string; rx: number } | null = null;
  for (const [f, vs] of porFormato) {
    if (vs.length < 3) continue;
    const media = vs.reduce((a, b) => a + b, 0) / vs.length;
    if (!melhorFormato || media > melhorFormato.rx) {
      melhorFormato = { rotulo: rotuloFormato(f), rx: Number(media.toFixed(2)) };
    }
  }

  // melhor horário: faixa de hora com maior alcance médio
  const porHora = new Map<number, number[]>();
  for (const l of linhas) {
    if (l.reach === null || !l.published_at) continue;
    const h = horaSaoPaulo(l.published_at);
    porHora.set(h, [...(porHora.get(h) ?? []), l.reach]);
  }
  let melhorHorario: { faixa: string; media: number } | null = null;
  for (const [h, vs] of porHora) {
    const media = vs.reduce((a, b) => a + b, 0) / vs.length;
    if (!melhorHorario || media > melhorHorario.media) {
      melhorHorario = {
        faixa: `${String(h).padStart(2, "0")}h–${String((h + 1) % 24).padStart(2, "0")}h`,
        media,
      };
    }
  }

  return {
    alcance,
    saves,
    shares,
    comments,
    likes,
    engajamento,
    publicados: linhas.length,
    rxMedio,
    melhorFormato,
    melhorHorario,
  };
}

/** Série de alcance por dia dentro do período. */
export function serieDiaria(linhas: LinhaMetrica[], dias: number) {
  const hoje = new Date();
  const chaves: string[] = [];
  const mapa = new Map<string, number>();
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje.getTime() - i * 86_400_000);
    const k = d.toISOString().slice(0, 10);
    chaves.push(k);
    mapa.set(k, 0);
  }
  for (const l of linhas) {
    if (!l.published_at || l.reach === null) continue;
    const k = l.published_at.slice(0, 10);
    if (mapa.has(k)) mapa.set(k, (mapa.get(k) ?? 0) + l.reach);
  }
  let acumulado = 0;
  return chaves.map((k) => {
    const valor = mapa.get(k) ?? 0;
    acumulado += valor;
    const [, m, d] = k.split("-");
    return { dia: `${d}/${m}`, alcance: valor, acumulado };
  });
}

export function distribuicaoFormatos(linhas: LinhaMetrica[]) {
  const mapa = new Map<string, number>();
  for (const l of linhas) {
    const chave = rotuloFormato(l.format);
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor);
}

export function textoFrescor(ultimo: number | null) {
  if (!ultimo) return "sem coleta";
  const s = Math.max(0, Math.round((Date.now() - ultimo) / 1000));
  if (s < 60) return `coletado há ${s}s`;
  if (s < 3600) return `coletado há ${Math.round(s / 60)}min`;
  if (s < 86_400) return `coletado há ${Math.round(s / 3600)}h`;
  return `coletado há ${Math.round(s / 86_400)}d`;
}

/* ---------- Comparação de períodos ---------- */

export type Intervalo = { desde: string; ate: string };

/** Intervalo do período atual (últimos N dias até agora). */
export function intervaloAtual(dias: number): Intervalo {
  const agora = Date.now();
  return {
    desde: new Date(agora - dias * 86_400_000).toISOString(),
    ate: new Date(agora).toISOString(),
  };
}

/** Intervalo imediatamente anterior, com a mesma duração. */
export function intervaloAnterior(dias: number): Intervalo {
  const agora = Date.now();
  const inicioAtual = agora - dias * 86_400_000;
  return {
    desde: new Date(inicioAtual - dias * 86_400_000).toISOString(),
    ate: new Date(inicioAtual).toISOString(),
  };
}

/** Variação percentual; null quando falta base. */
export function variacao(atual: number | null, anterior: number | null) {
  if (atual === null || anterior === null || !Number.isFinite(atual) || !Number.isFinite(anterior))
    return null;
  if (anterior === 0) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

/** Faixa neutra de ±2%. */
export function classeVariacao(v: number | null) {
  if (v === null) return "text-muted";
  if (v > 2) return "pill-bom";
  if (v < -2) return "pill-ruim";
  return "text-muted";
}

export function textoVariacao(v: number | null) {
  if (v === null) return "—";
  const sinal = v > 0 ? "+" : "";
  return `${sinal}${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Rótulo curto de um intervalo: "02–31 mar". */
export function rotuloIntervalo({ desde, ate }: Intervalo) {
  const f = (iso: string, comMes: boolean) =>
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      ...(comMes ? { month: "short" as const } : {}),
    })
      .format(new Date(iso))
      .replace(".", "");
  return `${f(desde, false)}–${f(ate, true)}`;
}

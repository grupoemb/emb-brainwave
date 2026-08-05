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
  followers_delta?: number | null;
  clicks?: number | null;
  retention_pct?: number | null;
  watch_time_s?: number | null;
};

export type PostBruto = {
  id: string;
  title: string;
  channel: string | null;
  format: string | null;
  hook?: string | null;
  pillar_id: string | null;
  published_at: string | null;
  source_handle: string | null;
  theme?: string | null;
  intent?: string | null;
};

export type Baseline = {
  channel: string;
  format: string;
  metric: string;
  median_value: number | null;
  p25?: number | null;
  p75?: number | null;
};

export type LinhaMetrica = {
  id: string;
  title: string;
  conta: string | null;
  format: Formato | null;
  hook: string | null;
  pillar_id: string | null;
  theme: string | null;
  intent: string | null;
  published_at: string | null;
  reach: number | null;
  impressions: number | null;
  saves: number | null;
  shares: number | null;
  comments: number | null;
  likes: number | null;
  followers_delta: number | null;
  clicks: number | null;
  retention_pct: number | null;
  watch_time_s: number | null;
  rx: number | null;
};



export const PALETA = ["#00a4ff", "#00e7ff", "#3ecf8e", "#f6bd24", "#a78bfa", "#ff7a6b"];

/** Limite do radar interno: alcance ≥ 2× a mediana do formato. */
export const LIMITE_OUTLIER = 2;

export function ehOutlier(rx: number | null | undefined) {
  return typeof rx === "number" && rx >= LIMITE_OUTLIER;
}

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

/** Número compacto em pt-BR: 8.420 → 8,4 mil · 1.240.000 → 1,2 mi. */
export function compacto(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000)
    return `${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (abs >= 1_000)
    return `${(v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
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
      hook: p.hook ?? null,
      pillar_id: p.pillar_id,
      theme: p.theme ?? null,
      intent: p.intent ?? null,
      published_at: p.published_at,
      reach,
      impressions: l?.impressions ?? null,
      saves: l?.saves ?? null,
      shares: l?.shares ?? null,
      comments: l?.comments ?? null,
      likes: l?.likes ?? null,
      followers_delta: l?.followers_delta ?? null,
      clicks: l?.clicks ?? null,
      retention_pct: l?.retention_pct ?? null,
      watch_time_s: l?.watch_time_s ?? null,


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

/* ---------- Métricas 2.0: taxas, dimensões, ritmo ---------- */

const media = (vs: number[]) => (vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null);

function taxa(parte: number | null, base: number | null) {
  if (parte === null || base === null || base <= 0) return null;
  return (parte / base) * 100;
}

export type Taxas = ReturnType<typeof calcularTaxas>;

/** Taxas relativas ao alcance + médias por post. */
export function calcularTaxas(linhas: LinhaMetrica[]) {
  const alcance = soma(linhas, "reach");
  const impressoes = soma(linhas, "impressions");
  const saves = soma(linhas, "saves");
  const shares = soma(linhas, "shares");
  const comments = soma(linhas, "comments");
  const likes = soma(linhas, "likes");
  const interacoes =
    likes === null && comments === null && saves === null && shares === null
      ? null
      : (likes ?? 0) + (comments ?? 0) + (saves ?? 0) + (shares ?? 0);
  const n = linhas.length;

  return {
    alcance,
    impressoes,
    interacoes,
    frequencia: impressoes !== null && alcance && alcance > 0 ? impressoes / alcance : null,
    taxaSalvamento: taxa(saves, alcance),
    taxaCompartilhamento: taxa(shares, alcance),
    taxaComentario: taxa(comments, alcance),
    taxaCurtida: taxa(likes, alcance),
    engajamento: taxa(interacoes, alcance),
    alcanceMedio: alcance !== null && n ? alcance / n : null,
    impressoesMedia: impressoes !== null && n ? impressoes / n : null,
    interacoesPorPost: interacoes !== null && n ? interacoes / n : null,
    /** % de posts com rx ≥ 1 (acima da mediana do formato). */
    taxaAcerto: (() => {
      const comRx = linhas.filter((l) => l.rx !== null);
      if (!comRx.length) return null;
      return (comRx.filter((l) => (l.rx as number) >= 1).length / comRx.length) * 100;
    })(),
    /** Dispersão do rx (desvio padrão) — quanto o resultado oscila. */
    consistencia: (() => {
      const vs = linhas.filter((l) => l.rx !== null).map((l) => l.rx as number);
      if (vs.length < 2) return null;
      const m = vs.reduce((a, b) => a + b, 0) / vs.length;
      return Math.sqrt(vs.reduce((s, v) => s + (v - m) ** 2, 0) / vs.length);
    })(),
    outliers: linhas.filter((l) => ehOutlier(l.rx)).length,
  };
}

export type Dimensao = "format" | "hook" | "pillar_id" | "theme" | "intent" | "conta";

export type ItemDimensao = {
  chave: string;
  rotulo: string;
  n: number;
  rxMedio: number | null;
  alcance: number;
  alcanceMedio: number | null;
  engajamento: number | null;
};

export const ROTULO_GANCHO: Record<string, string> = {
  question: "Pergunta",
  bold_claim: "Afirmação forte",
  story: "História",
  stat: "Dado",
  contrarian: "Contra-intuitivo",
  list: "Lista",
  news: "Notícia",
  how_to: "Passo a passo",
  other: "Outro",
};

export const ROTULO_INTENCAO: Record<string, string> = {
  educar: "Educar",
  vender: "Vender",
  engajar: "Engajar",
  autoridade: "Autoridade",
  entreter: "Entreter",
};

/** Agrega as linhas por uma dimensão, ordenando por rx médio (fallback alcance). */
export function porDimensao(
  linhas: LinhaMetrica[],
  dimensao: Dimensao,
  rotular?: (chave: string) => string,
): ItemDimensao[] {
  const grupos = new Map<string, LinhaMetrica[]>();
  for (const l of linhas) {
    const bruto = l[dimensao] as string | null;
    if (!bruto) continue;
    grupos.set(bruto, [...(grupos.get(bruto) ?? []), l]);
  }

  const padrao = (c: string) => {
    if (dimensao === "format") return rotuloFormato(c);
    if (dimensao === "hook") return ROTULO_GANCHO[c] ?? c;
    if (dimensao === "intent") return ROTULO_INTENCAO[c] ?? c;
    if (dimensao === "conta") return `@${c}`;
    return c;
  };

  return [...grupos.entries()]
    .map(([chave, ls]) => {
      const alcance = soma(ls, "reach") ?? 0;
      const t = calcularTaxas(ls);
      return {
        chave,
        rotulo: (rotular ?? padrao)(chave),
        n: ls.length,
        rxMedio: (() => {
          const vs = ls.filter((l) => l.rx !== null).map((l) => l.rx as number);
          const m = media(vs);
          return m === null ? null : Number(m.toFixed(2));
        })(),
        alcance,
        alcanceMedio: ls.length ? alcance / ls.length : null,
        engajamento: t.engajamento,
      };
    })
    .sort((a, b) => (b.rxMedio ?? -1) - (a.rxMedio ?? -1) || b.alcance - a.alcance);
}

/* ---------- Ritmo e horários ---------- */

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const FAIXAS_HORA = ["0-3", "3-6", "6-9", "9-12", "12-15", "15-18", "18-21", "21-24"];

function partesSaoPaulo(iso: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  });
  const partes = f.formatToParts(new Date(iso));
  const wd = partes.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { dia: idx < 0 ? 0 : idx, faixa: Math.floor(hora / 3) };
}

export type CelulaCalor = { dia: number; faixa: number; n: number; alcanceMedio: number | null };

/** Grade 7 dias × 8 faixas de 3h com alcance médio por publicação. */
export function mapaDeCalor(linhas: LinhaMetrica[]) {
  const grade: CelulaCalor[] = [];
  const acumulado = new Map<string, number[]>();

  for (const l of linhas) {
    if (!l.published_at || l.reach === null) continue;
    const { dia, faixa } = partesSaoPaulo(l.published_at);
    const k = `${dia}:${faixa}`;
    acumulado.set(k, [...(acumulado.get(k) ?? []), l.reach]);
  }

  for (let dia = 0; dia < 7; dia++) {
    for (let faixa = 0; faixa < 8; faixa++) {
      const vs = acumulado.get(`${dia}:${faixa}`) ?? [];
      grade.push({ dia, faixa, n: vs.length, alcanceMedio: media(vs) });
    }
  }

  const max = grade.reduce((m, c) => Math.max(m, c.alcanceMedio ?? 0), 0);
  const melhor = [...grade].sort((a, b) => (b.alcanceMedio ?? -1) - (a.alcanceMedio ?? -1))[0];
  return { grade, max, melhor: melhor && melhor.n > 0 ? melhor : null };
}

/** Ritmo de publicação no período. */
export function cadencia(linhas: LinhaMetrica[], dias: number) {
  const datas = linhas
    .map((l) => l.published_at)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  const porSemana = dias > 0 ? (linhas.length / dias) * 7 : null;

  let intervaloMedio: number | null = null;
  if (datas.length > 1) {
    let total = 0;
    for (let i = 1; i < datas.length; i++) total += datas[i]! - datas[i - 1]!;
    intervaloMedio = total / (datas.length - 1) / 86_400_000;
  }

  const diasComPost = new Set(
    linhas
      .map((l) => l.published_at?.slice(0, 10))
      .filter((d): d is string => !!d),
  ).size;

  return {
    posts: linhas.length,
    porSemana,
    intervaloMedio,
    diasComPost,
    diasSemPost: Math.max(0, dias - diasComPost),
    ultimoPost: datas.length ? datas[datas.length - 1]! : null,
  };
}

/**
 * Curva de maturação: quanto do alcance da última leitura já existia na primeira,
 * usando o histórico completo de post_metrics.
 */
export function maturacao(leituras: Leitura[]) {
  const porPost = new Map<string, Leitura[]>();
  for (const l of leituras) porPost.set(l.post_id, [...(porPost.get(l.post_id) ?? []), l]);

  const razoes: number[] = [];
  let crescimentoTotal = 0;
  let comHistorico = 0;

  for (const ls of porPost.values()) {
    const ordenadas = [...ls].sort(
      (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime(),
    );
    const primeira = ordenadas[0];
    const ultima = ordenadas[ordenadas.length - 1];
    if (!primeira || !ultima || ordenadas.length < 2) continue;
    if (primeira.reach === null || ultima.reach === null || ultima.reach <= 0) continue;
    comHistorico++;
    razoes.push((primeira.reach / ultima.reach) * 100);
    crescimentoTotal += ultima.reach - primeira.reach;
  }

  return {
    comHistorico,
    pctNaPrimeiraLeitura: media(razoes),
    crescimentoTotal: comHistorico ? crescimentoTotal : null,
  };
}

/** Série diária de um indicador qualquer (para sparklines). */
export function serieIndicador(
  linhas: LinhaMetrica[],
  dias: number,
  campo: "reach" | "impressions" | "saves" | "shares" | "comments" | "likes",
) {
  const mapa = new Map<string, number>();
  const chaves: string[] = [];
  const hoje = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const k = new Date(hoje.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    chaves.push(k);
    mapa.set(k, 0);
  }
  for (const l of linhas) {
    const v = l[campo];
    if (!l.published_at || typeof v !== "number") continue;
    const k = l.published_at.slice(0, 10);
    if (mapa.has(k)) mapa.set(k, (mapa.get(k) ?? 0) + v);
  }
  return chaves.map((k) => ({ dia: k, valor: mapa.get(k) ?? 0 }));
}

/** Etapas proporcionais: alcance → interações → salvamentos + compartilhamentos. */
export function funilInteracao(linhas: LinhaMetrica[]) {
  const t = calcularTaxas(linhas);
  const propagacao =
    t.alcance === null
      ? null
      : (soma(linhas, "saves") ?? 0) + (soma(linhas, "shares") ?? 0);

  return [
    { rotulo: "Alcance", valor: t.alcance, pct: 100 },
    {
      rotulo: "Interações",
      valor: t.interacoes,
      pct: t.engajamento ?? 0,
    },
    {
      rotulo: "Salvos + compartilhados",
      valor: propagacao,
      pct: taxa(propagacao, t.alcance) ?? 0,
    },
  ];
}


/* ---------- Drill-down: recortes clicáveis nos gráficos ---------- */

export type Recorte =
  | { tipo: "dia"; dia: string }
  | { tipo: "dimensao"; dimensao: Dimensao; chave: string; rotulo: string }
  | { tipo: "formatoNome"; nome: string }
  | { tipo: "calor"; dia: number; faixa: number };

/** Texto curto que descreve o recorte clicado. */
export function rotuloRecorte(r: Recorte) {
  if (r.tipo === "dia") return `Dia ${r.dia}`;
  if (r.tipo === "formatoNome") return `Formato · ${r.nome}`;
  if (r.tipo === "calor") return `${DIAS_SEMANA[r.dia]} · ${FAIXAS_HORA[r.faixa]}h`;
  const nomes: Record<Dimensao, string> = {
    format: "Formato",
    hook: "Gancho",
    pillar_id: "Pilar",
    theme: "Tema",
    intent: "Intenção",
    conta: "Conta",
  };
  return `${nomes[r.dimensao]} · ${r.rotulo}`;
}

/** Filtra as linhas já carregadas para o recorte selecionado. */
export function filtrarPorRecorte(linhas: LinhaMetrica[], r: Recorte) {
  if (r.tipo === "dia") {
    return linhas.filter((l) => {
      if (!l.published_at) return false;
      const [, m, d] = l.published_at.slice(0, 10).split("-");
      return `${d}/${m}` === r.dia;
    });
  }
  if (r.tipo === "formatoNome") {
    return linhas.filter((l) => rotuloFormato(l.format) === r.nome);
  }
  if (r.tipo === "calor") {
    return linhas.filter((l) => {
      if (!l.published_at) return false;
      const p = partesSaoPaulo(l.published_at);
      return p.dia === r.dia && p.faixa === r.faixa;
    });
  }
  return linhas.filter((l) => (l[r.dimensao] as string | null) === r.chave);
}

/** Resumo compacto de um conjunto de linhas — usado na comparação do drill-down. */
export function resumoRecorte(linhas: LinhaMetrica[]) {
  const t = calcularTaxas(linhas);
  const rxs = linhas.filter((l) => l.rx !== null).map((l) => l.rx as number);
  return {
    posts: linhas.length,
    alcance: t.alcance,
    alcanceMedio: t.alcanceMedio,
    rxMedio: rxs.length ? rxs.reduce((s, v) => s + v, 0) / rxs.length : null,
    engajamento: t.engajamento,
    interacoes: t.interacoes,
  };
}
export type ResumoRecorte = ReturnType<typeof resumoRecorte>;

// ===================== Catálogo de métricas da tabela de posts =====================

export type ChaveMetrica =
  | "published_at"
  | "reach"
  | "impressions"
  | "saves"
  | "shares"
  | "comments"
  | "likes"
  | "followers_delta"
  | "clicks"
  | "retention_pct"
  | "watch_time_s"
  | "eng_pct"
  | "saves_pct"
  | "shares_pct"
  | "comments_pct"
  | "frequencia"
  | "rx";

export type DefMetrica = {
  chave: ChaveMetrica;
  rotulo: string;
  grupo: "identificacao" | "alcance" | "interacao" | "desempenho";
  /** Métricas ainda não coletadas pela integração atual. */
  indisponivel?: boolean;
  valor: (l: LinhaMetrica) => number | null;
  formata: (v: number | null) => string;
};

const pctDe = (num: number | null, den: number | null) =>
  num === null || den === null || den <= 0 ? null : Number(((num / den) * 100).toFixed(2));

const fmtNum = (v: number | null) => (v === null ? "—" : compacto(v));
const fmtPct = (v: number | null) => (v === null ? "—" : `${numero(v, 1)}%`);

export const METRICAS_TABELA: DefMetrica[] = [
  {
    chave: "published_at",
    rotulo: "Data",
    grupo: "identificacao",
    valor: (l) => (l.published_at ? new Date(l.published_at).getTime() : null),
    formata: (v) =>
      v === null
        ? "—"
        : new Date(v).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            timeZone: "America/Sao_Paulo",
          }),
  },
  { chave: "reach", rotulo: "Alcance", grupo: "alcance", valor: (l) => l.reach, formata: fmtNum },
  {
    chave: "impressions",
    rotulo: "Impressões",
    grupo: "alcance",
    valor: (l) => l.impressions,
    formata: fmtNum,
  },
  {
    chave: "frequencia",
    rotulo: "Frequência",
    grupo: "alcance",
    valor: (l) =>
      l.impressions === null || !l.reach ? null : Number((l.impressions / l.reach).toFixed(2)),
    formata: (v) => (v === null ? "—" : `${numero(v, 2)}×`),
  },
  { chave: "saves", rotulo: "Salvos", grupo: "interacao", valor: (l) => l.saves, formata: fmtNum },
  { chave: "shares", rotulo: "Shares", grupo: "interacao", valor: (l) => l.shares, formata: fmtNum },
  {
    chave: "comments",
    rotulo: "Coment.",
    grupo: "interacao",
    valor: (l) => l.comments,
    formata: fmtNum,
  },
  { chave: "likes", rotulo: "Curtidas", grupo: "interacao", valor: (l) => l.likes, formata: fmtNum },
  {
    chave: "eng_pct",
    rotulo: "Engajamento %",
    grupo: "desempenho",
    valor: (l) => {
      const inter = [l.likes, l.comments, l.saves, l.shares];
      if (inter.every((v) => v === null)) return null;
      return pctDe(
        inter.reduce<number>((s, v) => s + (v ?? 0), 0),
        l.reach,
      );
    },
    formata: fmtPct,
  },
  {
    chave: "saves_pct",
    rotulo: "Salvos %",
    grupo: "desempenho",
    valor: (l) => pctDe(l.saves, l.reach),
    formata: fmtPct,
  },
  {
    chave: "shares_pct",
    rotulo: "Shares %",
    grupo: "desempenho",
    valor: (l) => pctDe(l.shares, l.reach),
    formata: fmtPct,
  },
  {
    chave: "comments_pct",
    rotulo: "Coment. %",
    grupo: "desempenho",
    valor: (l) => pctDe(l.comments, l.reach),
    formata: fmtPct,
  },
  {
    chave: "followers_delta",
    rotulo: "Seguidores",
    grupo: "desempenho",
    indisponivel: true,
    valor: (l) => l.followers_delta,
    formata: (v) => (v === null ? "—" : `${v > 0 ? "+" : ""}${compacto(v)}`),
  },
  {
    chave: "clicks",
    rotulo: "Cliques",
    grupo: "desempenho",
    indisponivel: true,
    valor: (l) => l.clicks,
    formata: fmtNum,
  },
  {
    chave: "retention_pct",
    rotulo: "Retenção",
    grupo: "desempenho",
    indisponivel: true,
    valor: (l) => l.retention_pct,
    formata: fmtPct,
  },
  {
    chave: "watch_time_s",
    rotulo: "Tempo de exib.",
    grupo: "desempenho",
    indisponivel: true,
    valor: (l) => l.watch_time_s,
    formata: (v) => (v === null ? "—" : `${compacto(v)}s`),
  },
  {
    chave: "rx",
    rotulo: "rx",
    grupo: "desempenho",
    valor: (l) => l.rx,
    formata: (v) => (v === null ? "—" : `${numero(v, 2)}×`),
  },
];

export const METRICA_POR_CHAVE = new Map(METRICAS_TABELA.map((m) => [m.chave, m]));

export function defMetrica(chave: ChaveMetrica): DefMetrica {
  return METRICA_POR_CHAVE.get(chave) ?? METRICAS_TABELA[0]!;
}

export type FaixaRx = "todas" | "acima" | "media" | "abaixo" | "outlier";

export const FAIXAS_RX: { valor: FaixaRx; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas as faixas" },
  { valor: "acima", rotulo: "Acima da média (≥ 1,3×)" },
  { valor: "media", rotulo: "Na média (0,7×–1,3×)" },
  { valor: "abaixo", rotulo: "Abaixo (< 0,7×)" },
  { valor: "outlier", rotulo: "Fora da curva (≥ 2×)" },
];

export function naFaixaRx(rx: number | null, faixa: FaixaRx) {
  if (faixa === "todas") return true;
  if (rx === null) return false;
  if (faixa === "acima") return rx >= 1.3;
  if (faixa === "media") return rx >= 0.7 && rx < 1.3;
  if (faixa === "abaixo") return rx < 0.7;
  return rx >= 2;
}

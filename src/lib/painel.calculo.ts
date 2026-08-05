import type {
  CelulaCalorPainel,
  ContaPainel,
  DestaquesPainel,
  KpisPainel,
  MelhorPost,
  MixFormato,
  OutlierPainel,
  PontoSerie,
} from "@/lib/painel.tipos";

export type LeituraBruta = {
  post_id: string;
  reach: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  retention_pct: number | null;
  followers_delta: number | null;
  captured_at: string;
};

export type PostBrutoPainel = {
  id: string;
  title: string;
  channel: string | null;
  format: string | null;
  meta: Record<string, unknown> | null;
  published_at: string | null;
};

export type BaselineBruta = {
  channel: string;
  format: string;
  median_value: number | null;
};

const TZ = "America/Sao_Paulo";

/** Chave YYYY-MM-DD no fuso de São Paulo. */
export function diaSP(iso: string) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
  return p;
}

function partesSP(iso: string) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const wd = partes.find((x) => x.type === "weekday")?.value ?? "Sun";
  const hora = Number(partes.find((x) => x.type === "hour")?.value ?? "0") % 24;
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { dia: idx < 0 ? 0 : idx, faixa: Math.floor(hora / 3) };
}

/** Última leitura por post (recebe leituras já ordenadas do mais recente ao mais antigo). */
export function ultimaPorPost(leituras: LeituraBruta[]) {
  const mapa = new Map<string, LeituraBruta>();
  for (const l of leituras) if (!mapa.has(l.post_id)) mapa.set(l.post_id, l);
  return mapa;
}

function arred(v: number, casas = 2) {
  return Number(v.toFixed(casas));
}

export type ResultadoAgregado = {
  kpis: KpisPainel;
  contas: ContaPainel[];
  destaques: DestaquesPainel;
  outliers: OutlierPainel[];
  serie: PontoSerie[];
  mixFormatos: MixFormato[];
  calor: { grade: CelulaCalorPainel[]; max: number };
};

export function agregarPainel(
  posts: PostBrutoPainel[],
  leituras: Map<string, LeituraBruta>,
  baselines: BaselineBruta[],
  dias: number,
  alcanceAnteriorPorConta: Map<string, number>,
  contasInfo: Map<string, { channel: string | null; avatarUrl: string | null }>,
): ResultadoAgregado {
  const outliers: OutlierPainel[] = [];
  const destaques: DestaquesPainel = {
    melhorAlcance: null,
    melhorEngajamento: null,
    maiorRx: null,
    maisSalvo: null,
    maisSeguidores: null,
    contaConsistente: null,
  };

  const totais = {
    alcance: 0,
    impressoes: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    seguidores: 0,
    comAlcance: 0,
    rxSoma: 0,
    rxN: 0,
    retSoma: 0,
    retN: 0,
    outliers: 0,
  };

  type Acumulado = {
    conta: string;
    channel: string | null;
    posts: number;
    alcance: number;
    interacoes: number;
    saves: number;
    shares: number;
    seguidores: number;
    comAlcance: number;
    rxSoma: number;
    rxN: number;
    rxAcima: number;
    outliers: number;
    melhor: MelhorPost | null;
    porDia: Map<string, number>;
  };

  const mapa = new Map<string, Acumulado>();
  const serieTotal = new Map<string, number>();
  const porFormato = new Map<string, { posts: number; alcance: number; rxSoma: number; rxN: number }>();
  const celulas = new Map<string, number[]>();

  for (const p of posts) {
    const bruto = p.meta?.["source_handle"];
    const conta = typeof bruto === "string" && bruto ? bruto : "sem conta";

    const l = leituras.get(p.id) ?? null;
    const reach = l?.reach ?? null;
    const interacoes = (l?.likes ?? 0) + (l?.comments ?? 0) + (l?.saves ?? 0) + (l?.shares ?? 0);
    const base = baselines.find((b) => b.channel === p.channel && b.format === p.format);
    const mediana = base?.median_value && base.median_value > 0 ? base.median_value : null;
    const rx = reach !== null && mediana !== null ? arred(reach / mediana) : null;
    const engajamento = reach && reach > 0 ? arred((interacoes / reach) * 100) : null;

    const item: MelhorPost = {
      id: p.id,
      title: p.title,
      conta: conta === "sem conta" ? null : conta,
      alcance: reach,
      rx,
      engajamento,
      seguidores: l?.followers_delta ?? null,
      saves: l?.saves ?? null,
    };

    if (rx !== null && rx >= 2) outliers.push({ id: p.id, title: p.title, conta: item.conta, rx });

    if (reach !== null && (destaques.melhorAlcance?.alcance ?? -1) < reach) {
      destaques.melhorAlcance = item;
    }
    if (engajamento !== null && (destaques.melhorEngajamento?.engajamento ?? -1) < engajamento) {
      destaques.melhorEngajamento = item;
    }
    if (rx !== null && (destaques.maiorRx?.rx ?? -1) < rx) destaques.maiorRx = item;
    if ((l?.saves ?? 0) > (destaques.maisSalvo?.saves ?? -1)) {
      if (l?.saves != null) destaques.maisSalvo = item;
    }
    if ((l?.followers_delta ?? 0) > (destaques.maisSeguidores?.seguidores ?? -1)) {
      if (l?.followers_delta != null) destaques.maisSeguidores = item;
    }

    // Totais da organização
    if (reach !== null) {
      totais.alcance += reach;
      totais.comAlcance += 1;
    }
    totais.impressoes += l?.impressions ?? 0;
    totais.likes += l?.likes ?? 0;
    totais.comments += l?.comments ?? 0;
    totais.saves += l?.saves ?? 0;
    totais.shares += l?.shares ?? 0;
    totais.seguidores += l?.followers_delta ?? 0;
    if (l?.retention_pct != null) {
      totais.retSoma += Number(l.retention_pct);
      totais.retN += 1;
    }
    if (rx !== null) {
      totais.rxSoma += rx;
      totais.rxN += 1;
      if (rx >= 2) totais.outliers += 1;
    }

    // Mix de formatos
    const fmt = p.format ?? "outro";
    const f = porFormato.get(fmt) ?? { posts: 0, alcance: 0, rxSoma: 0, rxN: 0 };
    f.posts += 1;
    f.alcance += reach ?? 0;
    if (rx !== null) {
      f.rxSoma += rx;
      f.rxN += 1;
    }
    porFormato.set(fmt, f);

    // Mapa de calor + séries
    if (p.published_at) {
      const { dia, faixa } = partesSP(p.published_at);
      if (reach !== null) {
        const k = `${dia}:${faixa}`;
        celulas.set(k, [...(celulas.get(k) ?? []), reach]);
      }
      const chave = diaSP(p.published_at);
      serieTotal.set(chave, (serieTotal.get(chave) ?? 0) + (reach ?? 0));
    }

    const a =
      mapa.get(conta) ??
      ({
        conta,
        channel: p.channel ?? contasInfo.get(conta)?.channel ?? null,
        posts: 0,
        alcance: 0,
        interacoes: 0,
        saves: 0,
        shares: 0,
        seguidores: 0,
        comAlcance: 0,
        rxSoma: 0,
        rxN: 0,
        rxAcima: 0,
        outliers: 0,
        melhor: null,
        porDia: new Map<string, number>(),
      } satisfies Acumulado);

    a.posts += 1;
    a.saves += l?.saves ?? 0;
    a.shares += l?.shares ?? 0;
    a.seguidores += l?.followers_delta ?? 0;
    if (reach !== null) {
      a.alcance += reach;
      a.interacoes += interacoes;
      a.comAlcance += 1;
    }
    if (rx !== null) {
      a.rxSoma += rx;
      a.rxN += 1;
      if (rx >= 1) a.rxAcima += 1;
      if (rx >= 2) a.outliers += 1;
    }
    if (reach !== null && (a.melhor?.alcance ?? -1) < reach) a.melhor = item;
    if (p.published_at) {
      const chave = diaSP(p.published_at);
      a.porDia.set(chave, (a.porDia.get(chave) ?? 0) + (reach ?? 0));
    }
    mapa.set(conta, a);
  }

  outliers.sort((a, b) => b.rx - a.rx);

  // Série contínua de dias (do mais antigo ao mais recente)
  const chaves: string[] = [];
  const hoje = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    chaves.push(diaSP(new Date(hoje.getTime() - i * 86_400_000).toISOString()));
  }
  const serie: PontoSerie[] = chaves.map((dia) => ({ dia, valor: serieTotal.get(dia) ?? 0 }));

  const contas: ContaPainel[] = [];
  for (const a of mapa.values()) {
    const anterior = alcanceAnteriorPorConta.get(a.conta) ?? 0;
    contas.push({
      conta: a.conta,
      channel: a.channel,
      avatarUrl: contasInfo.get(a.conta)?.avatarUrl ?? null,
      posts: a.posts,
      alcance: a.comAlcance ? a.alcance : null,
      alcanceMedio: a.comAlcance ? Math.round(a.alcance / a.comAlcance) : null,
      engajamento: a.alcance > 0 ? arred((a.interacoes / a.alcance) * 100) : null,
      rxMedio: a.rxN ? arred(a.rxSoma / a.rxN) : null,
      outliers: a.outliers,
      consistencia: a.rxN ? Number(((a.rxAcima / a.rxN) * 100).toFixed(0)) : null,
      variacaoAlcance: anterior > 0 ? arred(((a.alcance - anterior) / anterior) * 100, 1) : null,
      saves: a.saves,
      shares: a.shares,
      seguidores: a.seguidores,
      serie: chaves.map((dia) => ({ dia, valor: a.porDia.get(dia) ?? 0 })),
      melhorPost: a.melhor,
    });
  }
  contas.sort((x, y) => (y.alcance ?? 0) - (x.alcance ?? 0));

  const consistente = contas
    .filter((c) => c.consistencia !== null)
    .sort((x, y) => (y.consistencia ?? 0) - (x.consistencia ?? 0))[0];
  if (consistente) {
    destaques.contaConsistente = {
      conta: consistente.conta,
      consistencia: consistente.consistencia ?? 0,
    };
  }

  const grade: CelulaCalorPainel[] = [];
  for (let dia = 0; dia < 7; dia++) {
    for (let faixa = 0; faixa < 8; faixa++) {
      const vs = celulas.get(`${dia}:${faixa}`) ?? [];
      grade.push({
        dia,
        faixa,
        n: vs.length,
        alcanceMedio: vs.length ? Math.round(vs.reduce((t, v) => t + v, 0) / vs.length) : null,
      });
    }
  }
  const maxCalor = grade.reduce((m, c) => Math.max(m, c.alcanceMedio ?? 0), 0);

  const mixFormatos: MixFormato[] = [...porFormato.entries()]
    .map(([formato, f]) => ({
      formato,
      posts: f.posts,
      alcance: f.alcance,
      rxMedio: f.rxN ? arred(f.rxSoma / f.rxN) : null,
    }))
    .sort((a, b) => b.alcance - a.alcance);

  const interacoes = totais.likes + totais.comments + totais.saves + totais.shares;

  const kpis: KpisPainel = {
    alcance: totais.comAlcance ? totais.alcance : null,
    impressoes: totais.impressoes || null,
    interacoes: posts.length ? interacoes : null,
    engajamento: totais.alcance > 0 ? arred((interacoes / totais.alcance) * 100) : null,
    saves: posts.length ? totais.saves : null,
    shares: posts.length ? totais.shares : null,
    comments: posts.length ? totais.comments : null,
    likes: posts.length ? totais.likes : null,
    seguidores: posts.length ? totais.seguidores : null,
    retencao: totais.retN ? arred(totais.retSoma / totais.retN, 1) : null,
    rxMedio: totais.rxN ? arred(totais.rxSoma / totais.rxN) : null,
    outliers: totais.outliers,
    publicados: posts.length,
    frequencia: dias > 0 ? arred((posts.length / dias) * 7, 1) : null,
  };

  return { kpis, contas, destaques, outliers, serie, mixFormatos, calor: { grade, max: maxCalor } };
}

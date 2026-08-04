import type { Baseline, LinhaMetrica, Taxas } from "@/lib/metricas";

export type MetricaBase = "reach" | "impressions" | "likes" | "comments" | "saves" | "shares";

export type Faixa = { p25: number; mediana: number; p75: number };
export type NomeFaixa = "ruim" | "regular" | "bom" | "excelente";

/**
 * Referência de mercado (constante curada) — Instagram, taxas calculadas sobre alcance.
 * Base: medianas públicas de benchmarks de engajamento de Instagram (Rival IQ /
 * Social Blade / Metricool), consolidação 2025. Atualize aqui quando sair novo estudo.
 */
export const MERCADO = {
  engajamento: 4.7,
  taxaSalvamento: 0.8,
  taxaCompartilhamento: 0.6,
  taxaComentario: 0.15,
} as const;

export const FONTE_MERCADO = "Média de mercado do Instagram (consolidado 2025)";

export const ROTULO_FAIXA: Record<NomeFaixa, string> = {
  ruim: "Abaixo do padrão",
  regular: "Regular",
  bom: "Bom",
  excelente: "Excelente",
};

export const CLASSE_FAIXA: Record<NomeFaixa, string> = {
  ruim: "pill pill-ruim",
  regular: "pill pill-alerta",
  bom: "pill pill-bom",
  excelente: "pill pill-bom",
};

export const COR_FAIXA: Record<NomeFaixa, string> = {
  ruim: "#ff7a6b",
  regular: "#f6bd24",
  bom: "#00a4ff",
  excelente: "#3ecf8e",
};

/** Quantos posts de cada formato existem no recorte atual. */
export function mixFormatos(linhas: LinhaMetrica[]) {
  const mapa = new Map<string, number>();
  for (const l of linhas) {
    if (!l.format) continue;
    mapa.set(l.format, (mapa.get(l.format) ?? 0) + 1);
  }
  return mapa;
}

/** Faixa da métrica ponderada pela quantidade de posts de cada formato no recorte. */
export function faixaPonderada(
  baselines: Baseline[],
  mix: Map<string, number>,
  metric: MetricaBase,
  channel = "instagram",
): Faixa | null {
  let peso = 0;
  let p25 = 0;
  let mediana = 0;
  let p75 = 0;

  for (const [formato, n] of mix) {
    const b = baselines.find(
      (x) => x.channel === channel && x.format === formato && x.metric === metric,
    );
    if (!b || b.median_value == null) continue;
    const b25 = b.p25 ?? b.median_value * 0.6;
    const b75 = b.p75 ?? b.median_value * 1.5;
    peso += n;
    p25 += b25 * n;
    mediana += b.median_value * n;
    p75 += b75 * n;
  }

  if (!peso) return null;
  return { p25: p25 / peso, mediana: mediana / peso, p75: p75 / peso };
}

export function classificar(valor: number | null, faixa: Faixa | null): NomeFaixa | null {
  if (valor === null || !faixa) return null;
  if (valor < faixa.p25) return "ruim";
  if (valor < faixa.mediana) return "regular";
  if (valor < faixa.p75) return "bom";
  return "excelente";
}

/** Posição 0–100 do marcador: p25=25%, mediana=50%, p75=75%, teto em 1,5× p75. */
export function posicao(valor: number | null, faixa: Faixa | null) {
  if (valor === null || !faixa) return null;
  const { p25, mediana, p75 } = faixa;
  const interp = (v: number, a: number, b: number, ia: number, ib: number) =>
    b <= a ? ia : ia + ((v - a) / (b - a)) * (ib - ia);

  if (valor <= 0) return 0;
  if (valor < p25) return Math.max(2, interp(valor, 0, p25, 0, 25));
  if (valor < mediana) return interp(valor, p25, mediana, 25, 50);
  if (valor < p75) return interp(valor, mediana, p75, 50, 75);
  return Math.min(98, interp(valor, p75, p75 * 1.5, 75, 100));
}

export type LinhaTermometro = {
  chave: MetricaBase;
  rotulo: string;
  descricao: string;
  valor: number | null;
  faixa: Faixa | null;
  casas: number;
};

const INDICADORES: { chave: MetricaBase; rotulo: string; descricao: string }[] = [
  { chave: "reach", rotulo: "Alcance por post", descricao: "Contas únicas alcançadas em média." },
  {
    chave: "impressions",
    rotulo: "Impressões por post",
    descricao: "Exibições totais em média por post.",
  },
  { chave: "likes", rotulo: "Curtidas por post", descricao: "Média de curtidas por publicação." },
  {
    chave: "comments",
    rotulo: "Comentários por post",
    descricao: "Média de comentários por publicação.",
  },
  {
    chave: "saves",
    rotulo: "Salvamentos por post",
    descricao: "Sinal mais forte de conteúdo útil.",
  },
  {
    chave: "shares",
    rotulo: "Compartilhamentos por post",
    descricao: "Sinal de propagação para fora da base.",
  },
];

function mediaPorPost(linhas: LinhaMetrica[], campo: MetricaBase) {
  const chave =
    campo === "reach"
      ? "reach"
      : campo === "impressions"
        ? "impressions"
        : campo === "likes"
          ? "likes"
          : campo === "comments"
            ? "comments"
            : campo === "saves"
              ? "saves"
              : "shares";
  const vs = linhas
    .map((l) => l[chave as keyof LinhaMetrica] as number | null)
    .filter((v): v is number => typeof v === "number");
  if (!vs.length) return null;
  return vs.reduce((a, b) => a + b, 0) / vs.length;
}

export function termometros(linhas: LinhaMetrica[], baselines: Baseline[]): LinhaTermometro[] {
  const mix = mixFormatos(linhas);
  return INDICADORES.map((i) => ({
    ...i,
    valor: mediaPorPost(linhas, i.chave),
    faixa: faixaPonderada(baselines, mix, i.chave),
    casas: i.chave === "reach" || i.chave === "impressions" ? 0 : 1,
  }));
}

export type LinhaMercado = {
  rotulo: string;
  atual: number | null;
  referencia: number;
  descricao: string;
};

export function comparativoMercado(taxas: Taxas): LinhaMercado[] {
  return [
    {
      rotulo: "Taxa de engajamento",
      atual: taxas.engajamento,
      referencia: MERCADO.engajamento,
      descricao: "Interações ÷ alcance.",
    },
    {
      rotulo: "Taxa de salvamento",
      atual: taxas.taxaSalvamento,
      referencia: MERCADO.taxaSalvamento,
      descricao: "Salvamentos ÷ alcance.",
    },
    {
      rotulo: "Taxa de compartilhamento",
      atual: taxas.taxaCompartilhamento,
      referencia: MERCADO.taxaCompartilhamento,
      descricao: "Compartilhamentos ÷ alcance.",
    },
    {
      rotulo: "Taxa de comentário",
      atual: taxas.taxaComentario,
      referencia: MERCADO.taxaComentario,
      descricao: "Comentários ÷ alcance.",
    },
  ];
}

export type Meta = {
  chave: string;
  rotulo: string;
  atual: number | null;
  alvo: number | null;
  casas: number;
  sufixo: string;
  logica: string;
};

export function metasSugeridas({
  linhas,
  taxas,
  baselines,
  publicados,
  porSemana,
}: {
  linhas: LinhaMetrica[];
  taxas: Taxas;
  baselines: Baseline[];
  publicados: number;
  porSemana: number | null;
}): Meta[] {
  const mix = mixFormatos(linhas);
  const fReach = faixaPonderada(baselines, mix, "reach");
  const fSaves = faixaPonderada(baselines, mix, "saves");
  const fShares = faixaPonderada(baselines, mix, "shares");

  const taxaInterna = (f: Faixa | null) =>
    f && fReach && fReach.p75 > 0 ? (f.p75 / fReach.p75) * 100 : null;

  const alvoSalvar = Math.max(taxaInterna(fSaves) ?? 0, MERCADO.taxaSalvamento);
  const alvoCompartilhar = Math.max(taxaInterna(fShares) ?? 0, MERCADO.taxaCompartilhamento);

  return [
    {
      chave: "alcance",
      rotulo: "Alcance médio por post",
      atual: taxas.alcanceMedio,
      alvo: fReach ? Math.round(fReach.p75) : null,
      casas: 0,
      sufixo: "",
      logica: "Alvo = p75 da própria base, no mix de formatos que você publica hoje.",
    },
    {
      chave: "acerto",
      rotulo: "Taxa de acerto (rx ≥ 1)",
      atual: taxas.taxaAcerto,
      alvo: taxas.taxaAcerto === null ? 50 : Math.min(70, taxas.taxaAcerto + 10),
      casas: 1,
      sufixo: "%",
      logica: "Alvo = 10 pontos acima do atual, com teto de 70%.",
    },
    {
      chave: "outliers",
      rotulo: "Posts fora da curva",
      atual: taxas.outliers,
      alvo: Math.max(1, Math.ceil(publicados / 10)),
      casas: 0,
      sufixo: "",
      logica: "Alvo = ao menos 1 post fora da curva a cada 10 publicações.",
    },
    {
      chave: "salvamento",
      rotulo: "Taxa de salvamento",
      atual: taxas.taxaSalvamento,
      alvo: Number(alvoSalvar.toFixed(2)),
      casas: 2,
      sufixo: "%",
      logica: "Alvo = o maior entre o p75 interno e a referência de mercado.",
    },
    {
      chave: "compartilhamento",
      rotulo: "Taxa de compartilhamento",
      atual: taxas.taxaCompartilhamento,
      alvo: Number(alvoCompartilhar.toFixed(2)),
      casas: 2,
      sufixo: "%",
      logica: "Alvo = o maior entre o p75 interno e a referência de mercado.",
    },
    {
      chave: "cadencia",
      rotulo: "Posts por semana",
      atual: porSemana,
      alvo: Math.max(3, Math.ceil(porSemana ?? 0)),
      casas: 1,
      sufixo: "",
      logica: "Alvo = mínimo de 3 posts por semana, subindo a régua do ritmo atual.",
    },
  ];
}

export type FaixaConta = {
  conta: string;
  alcanceMedio: number | null;
  faixaAlcance: NomeFaixa | null;
  engajamento: number | null;
  faixaEngajamento: NomeFaixa | null;
  rxMedio: number | null;
  faixaRx: NomeFaixa | null;
};

export function faixaTaxa(valor: number | null, referencia: number): NomeFaixa | null {
  if (valor === null) return null;
  if (valor < referencia * 0.6) return "ruim";
  if (valor < referencia) return "regular";
  if (valor < referencia * 1.5) return "bom";
  return "excelente";
}

export function faixaRx(rx: number | null): NomeFaixa | null {
  if (rx === null) return null;
  if (rx < 0.7) return "ruim";
  if (rx < 1) return "regular";
  if (rx < 1.3) return "bom";
  return "excelente";
}

import type { DadosPainel, PontoSerie } from "@/lib/painel.tipos";
import { compacto, numero } from "@/lib/metricas";

export type Foco = "crescimento" | "engajamento" | "producao";

export const FOCOS: { valor: Foco; rotulo: string }[] = [
  { valor: "crescimento", rotulo: "Crescimento" },
  { valor: "engajamento", rotulo: "Engajamento" },
  { valor: "producao", rotulo: "Produção" },
];

export const ACENTOS = {
  azure: "#00a4ff",
  cyan: "#00e7ff",
  bom: "#3ecf8e",
  alerta: "#f6bd24",
  violeta: "#b06cff",
  ruim: "#ff7a6b",
} as const;

export type Heroi = {
  chave: string;
  rotulo: string;
  valor: number | null;
  anterior: number | null;
  cor: string;
  dica: string;
  sufixo?: string;
  casas?: number;
  compactar?: boolean;
  serie?: PontoSerie[];
};

/** Os 3 KPIs "heróis" de cada lente. */
export function heroisDoFoco(dados: DadosPainel, foco: Foco): Heroi[] {
  const k = dados.kpis;
  const a = dados.anterior;
  const op = dados.operacao;

  if (foco === "engajamento") {
    return [
      {
        chave: "engajamento",
        rotulo: "Engajamento",
        valor: k.engajamento,
        anterior: a?.engajamento ?? null,
        cor: ACENTOS.bom,
        casas: 2,
        sufixo: "%",
        dica: "Interações sobre alcance dos posts do período.",
      },
      {
        chave: "saves",
        rotulo: "Salvamentos",
        valor: k.saves,
        anterior: a?.saves ?? null,
        cor: ACENTOS.cyan,
        compactar: true,
        dica: "Sinal mais forte de conteúdo de valor.",
      },
      {
        chave: "shares",
        rotulo: "Compartilhamentos",
        valor: k.shares,
        anterior: a?.shares ?? null,
        cor: ACENTOS.violeta,
        compactar: true,
        dica: "Principal motor de alcance novo.",
      },
    ];
  }

  if (foco === "producao") {
    return [
      {
        chave: "publicados",
        rotulo: "Posts publicados",
        valor: k.publicados,
        anterior: a?.publicados ?? null,
        cor: ACENTOS.violeta,
        dica: "Posts publicados dentro da janela.",
      },
      {
        chave: "agendados",
        rotulo: "Agendados 7d",
        valor: op.agendados,
        anterior: null,
        cor: ACENTOS.azure,
        dica: "Posts com data marcada nos próximos 7 dias.",
      },
      {
        chave: "pautas",
        rotulo: "Pautas novas",
        valor: op.pautasNovas,
        anterior: null,
        cor: ACENTOS.alerta,
        dica: "Pautas aguardando decisão.",
      },
    ];
  }

  return [
    {
      chave: "alcance",
      rotulo: "Alcance",
      valor: k.alcance,
      anterior: a?.alcance ?? null,
      cor: ACENTOS.azure,
      compactar: true,
      serie: dados.serie,
      dica: "Pessoas únicas alcançadas pelos posts do período.",
    },
    {
      chave: "seguidores",
      rotulo: "Novos seguidores",
      valor: k.seguidores,
      anterior: a?.seguidores ?? null,
      cor: ACENTOS.bom,
      compactar: true,
      dica: "Saldo de seguidores atribuído aos posts do período.",
    },
    {
      chave: "frequencia",
      rotulo: "Ritmo semanal",
      valor: k.frequencia,
      anterior: a?.frequencia ?? null,
      cor: ACENTOS.cyan,
      casas: 1,
      sufixo: "/sem",
      dica: "Média de posts publicados por semana na janela.",
    },
  ];
}

export type Manchete = { tom: "bom" | "ruim" | "neutro"; texto: string };

type Candidata = {
  rotulo: string;
  atual: number | null;
  anterior: number | null;
};

function variacao(c: Candidata) {
  if (c.atual === null || c.anterior === null || c.anterior === 0) return null;
  return ((c.atual - c.anterior) / Math.abs(c.anterior)) * 100;
}

/** Manchetes determinísticas comparando o período com o anterior. */
export function manchetes(dados: DadosPainel): Manchete[] {
  const k = dados.kpis;
  const a = dados.anterior;
  const saida: Manchete[] = [];

  const candidatas: Candidata[] = [
    { rotulo: "Alcance", atual: k.alcance, anterior: a?.alcance ?? null },
    { rotulo: "Engajamento", atual: k.engajamento, anterior: a?.engajamento ?? null },
    { rotulo: "Salvamentos", atual: k.saves, anterior: a?.saves ?? null },
    { rotulo: "Compartilhamentos", atual: k.shares, anterior: a?.shares ?? null },
    { rotulo: "Novos seguidores", atual: k.seguidores, anterior: a?.seguidores ?? null },
    { rotulo: "Posts publicados", atual: k.publicados, anterior: a?.publicados ?? null },
  ];

  const comVariacao = candidatas
    .map((c) => ({ ...c, v: variacao(c) }))
    .filter((c): c is Candidata & { v: number } => c.v !== null);

  const melhor = comVariacao
    .filter((c) => c.v >= 10)
    .sort((x, y) => y.v - x.v)[0];

  if (melhor) {
    const puxador = [...dados.contas]
      .sort((x, y) => (y.alcance ?? 0) - (x.alcance ?? 0))[0];
    const complemento =
      melhor.rotulo === "Alcance" && puxador ? `, puxado por @${puxador.conta}` : "";
    saida.push({
      tom: "bom",
      texto: `${melhor.rotulo} subiu ${numero(melhor.v, 0)}% vs. o período anterior${complemento}.`,
    });
  }

  const pior = comVariacao
    .filter((c) => c.v <= -15 && c.rotulo !== melhor?.rotulo)
    .sort((x, y) => x.v - y.v)[0];

  if (pior) {
    saida.push({
      tom: "ruim",
      texto: `${pior.rotulo} caiu ${numero(Math.abs(pior.v), 0)}% — vale investigar.`,
    });
  }

  const top = dados.destaques.melhorAlcance;
  if (top) {
    const conta = top.conta ? ` (@${top.conta})` : "";
    saida.push({
      tom: "neutro",
      texto: `Destaque: "${top.title}"${conta} com ${compacto(top.alcance)} de alcance.`,
    });
  }

  if (saida.length === 0) {
    saida.push({
      tom: "neutro",
      texto: "Ainda não há período anterior suficiente para comparar. Siga publicando.",
    });
  }

  return saida.slice(0, 3);
}

/** Dias fora da curva de uma série (>= 1.6× a mediana), para destacar no gráfico. */
export function diasForaDaCurva(serie: PontoSerie[]) {
  const valores = serie.map((p) => p.valor).filter((v) => v > 0).sort((x, y) => x - y);
  if (valores.length < 4) return new Set<string>();
  const meio = Math.floor(valores.length / 2);
  const mediana =
    valores.length % 2 === 0
      ? ((valores[meio - 1] ?? 0) + (valores[meio] ?? 0)) / 2
      : (valores[meio] ?? 0);
  if (mediana <= 0) return new Set<string>();
  return new Set(serie.filter((p) => p.valor >= mediana * 1.6).map((p) => p.dia));
}

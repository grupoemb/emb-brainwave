/** Tipos compartilhados do painel do gestor (home). */

export type AgendadoPainel = {
  id: string;
  title: string;
  channel: string | null;
  scheduled_for: string;
  aprovado: boolean;
};

export type PautaPainel = {
  id: string;
  title: string;
  rationale: string | null;
  priority: number;
};

export type InsightPainel = {
  id: string;
  statement: string;
  strength: number;
};

export type OutlierPainel = {
  id: string;
  title: string;
  conta: string | null;
  rx: number;
};

export type MelhorPost = {
  id: string;
  title: string;
  conta: string | null;
  alcance: number | null;
  rx: number | null;
  engajamento: number | null;
  seguidores: number | null;
  saves: number | null;
};

export type PontoSerie = { dia: string; valor: number };

export type ContaPainel = {
  conta: string;
  channel: string | null;
  avatarUrl: string | null;
  posts: number;
  alcance: number | null;
  alcanceMedio: number | null;
  engajamento: number | null;
  rxMedio: number | null;
  outliers: number;
  consistencia: number | null;
  variacaoAlcance: number | null;
  saves: number;
  shares: number;
  seguidores: number;
  serie: PontoSerie[];
  melhorPost: MelhorPost | null;
};

export type DestaquesPainel = {
  melhorAlcance: MelhorPost | null;
  melhorEngajamento: MelhorPost | null;
  maiorRx: MelhorPost | null;
  maisSalvo: MelhorPost | null;
  maisSeguidores: MelhorPost | null;
  contaConsistente: { conta: string; consistencia: number } | null;
};

export type KpisPainel = {
  alcance: number | null;
  impressoes: number | null;
  interacoes: number | null;
  engajamento: number | null;
  saves: number | null;
  shares: number | null;
  comments: number | null;
  likes: number | null;
  seguidores: number | null;
  retencao: number | null;
  rxMedio: number | null;
  outliers: number;
  publicados: number;
  frequencia: number | null;
};

export type CelulaCalorPainel = {
  dia: number;
  faixa: number;
  n: number;
  alcanceMedio: number | null;
};

export type MixFormato = {
  formato: string;
  posts: number;
  alcance: number;
  rxMedio: number | null;
};

export type PerfilPainel = { handle: string; avatarUrl: string | null };

export type DadosPainel = {
  nome: string | null;
  ultimaColeta: string | null;
  dias: number;
  perfis: PerfilPainel[];
  perfilAtivo: string | null;
  kpis: KpisPainel;
  anterior: KpisPainel | null;

  operacao: {
    agendados: number;
    aguardandoAprovacao: number;
    pautasNovas: number;
    contasConectadas: number;
  };
  agendados: AgendadoPainel[];
  pautas: PautaPainel[];
  insights: InsightPainel[];
  outliers: OutlierPainel[];
  contas: ContaPainel[];
  destaques: DestaquesPainel;
  producao: Record<string, number>;
  serie: PontoSerie[];
  serieAnterior: PontoSerie[];

  mixFormatos: MixFormato[];
  calor: { grade: CelulaCalorPainel[]; max: number };
  audiencia: { temas: { texto: string; n: number }[]; perguntas: { texto: string; n: number }[] };
};

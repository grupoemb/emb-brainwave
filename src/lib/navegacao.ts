import {
  LayoutDashboard,
  CalendarDays,
  KanbanSquare,
  PenLine,
  BarChart3,
  Lightbulb,
  Target,
  Brain,
  Radar,
  Settings,
} from "lucide-react";

export type ItemNav = {
  rotulo: string;
  to: string;
  icone: typeof LayoutDashboard;
  subtitulo: string;
  desativado?: boolean;
  /** termos extras que ajudam a encontrar a página na busca global */
  sinonimos?: string[];
};

export const GRUPOS: { grupo: string; itens: ItemNav[] }[] = [
  {
    grupo: "Operação",
    itens: [
      {
        rotulo: "Painel",
        to: "/",
        icone: LayoutDashboard,
        subtitulo: "O resumo do dia da equipe",
        sinonimos: ["home", "dashboard", "resumo", "inicio"],
      },
      {
        rotulo: "Calendário",
        to: "/calendario",
        icone: CalendarDays,
        subtitulo: "Agenda de publicações por dia",
        sinonimos: ["agenda", "agendamento", "datas"],
      },
      {
        rotulo: "Kanban",
        to: "/kanban",
        icone: KanbanSquare,
        subtitulo: "Fluxo de produção por etapa",
        sinonimos: ["fluxo", "producao", "etapas", "quadro"],
      },
      {
        rotulo: "Criar",
        to: "/criar",
        icone: PenLine,
        subtitulo: "Estúdio de geração com IA",
        sinonimos: ["estudio", "ia", "gerar", "roteiro"],
      },
    ],
  },
  {
    grupo: "Inteligência",
    itens: [
      {
        rotulo: "Métricas",
        to: "/metricas",
        icone: BarChart3,
        subtitulo: "Desempenho, ritmo e benchmark",
        sinonimos: ["alcance", "engajamento", "benchmark", "kpi", "rx"],
      },
      {
        rotulo: "Metas",
        to: "/metas",
        icone: Target,
        subtitulo: "Alvos, ritmo e projeção de cada KPI",
        sinonimos: ["objetivo", "pace", "ritmo", "projecao", "meta"],
      },
      {
        rotulo: "Pautas",
        to: "/pautas",
        icone: Lightbulb,
        subtitulo: "Ideias sugeridas e o resultado de cada uma",
        sinonimos: ["ideias", "sugestoes"],
      },
      {
        rotulo: "Cérebro",
        to: "/cerebro",
        icone: Brain,
        subtitulo: "Playbook e aprendizados da marca",
        sinonimos: ["playbook", "marca", "insights", "audiencia"],
      },
      {
        rotulo: "Reels Radar",
        to: "/radar",
        icone: Radar,
        subtitulo: "Referências e leitura do mercado",
        sinonimos: ["referencias", "biblioteca", "mercado", "concorrentes"],
      },
    ],
  },
  {
    grupo: "Configuração",
    itens: [
      {
        rotulo: "Ajustes",
        to: "/ajustes",
        icone: Settings,
        subtitulo: "Perfil, equipe, contas e marca",
        sinonimos: ["perfil", "equipe", "contas", "pilares", "templates"],
      },
    ],
  },
];

export const TODOS_ITENS: ItemNav[] = GRUPOS.flatMap((g) => g.itens);

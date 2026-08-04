import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  CalendarDays,
  KanbanSquare,
  PenLine,
  BarChart3,
  Lightbulb,
  Brain,
  Radar,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { obterMeuPerfil } from "@/lib/perfil.functions";
import { useEffect, useState, type ReactNode } from "react";

type ItemNav = {
  rotulo: string;
  to: string;
  icone: typeof LayoutDashboard;
  subtitulo: string;
  desativado?: boolean;
};

const GRUPOS: { grupo: string; itens: ItemNav[] }[] = [
  {
    grupo: "Operação",
    itens: [
      {
        rotulo: "Painel",
        to: "/",
        icone: LayoutDashboard,
        subtitulo: "O resumo do dia da equipe",
      },
      {
        rotulo: "Calendário",
        to: "/calendario",
        icone: CalendarDays,
        subtitulo: "Agenda de publicações por dia",
      },
      {
        rotulo: "Kanban",
        to: "/kanban",
        icone: KanbanSquare,
        subtitulo: "Fluxo de produção por etapa",
      },
      { rotulo: "Criar", to: "/criar", icone: PenLine, subtitulo: "Estúdio de geração com IA" },
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
      },
      {
        rotulo: "Pautas",
        to: "/pautas",
        icone: Lightbulb,
        subtitulo: "Ideias sugeridas e o resultado de cada uma",
      },
      { rotulo: "Cérebro", to: "/cerebro", icone: Brain, subtitulo: "Playbook e aprendizados da marca" },
      {
        rotulo: "Reels Radar",
        to: "/radar",
        icone: Radar,
        subtitulo: "Referências e leitura do mercado",
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
      },
    ],
  },
];

const TODOS = GRUPOS.flatMap((g) => g.itens);

function Navegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-4 px-3 py-3">
      {GRUPOS.map((grupo) => (
        <div key={grupo.grupo} className="flex flex-col gap-1">
          <span className="rotulo px-3 pb-1 text-[.62rem]">{grupo.grupo}</span>
          {grupo.itens.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.to;

            if (item.desativado) {
              return (
                <span
                  key={item.to}
                  title="Em breve"
                  aria-disabled="true"
                  className="flex min-h-11 cursor-not-allowed items-center gap-2.5 rounded-[.6rem] px-3 text-sm text-muted opacity-45"
                >
                  <Icone size={16} />
                  {item.rotulo}
                </span>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={aoNavegar}
                title={item.subtitulo}
                className={
                  "group relative flex min-h-11 items-center gap-2.5 rounded-[.6rem] px-3 text-sm transition-all duration-150 " +
                  (ativo
                    ? "bg-azure/14 font-semibold text-white"
                    : "text-muted hover:bg-white/4 hover:text-corpo")
                }
              >
                <span
                  aria-hidden
                  className={
                    "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-azure transition-opacity " +
                    (ativo ? "opacity-100" : "opacity-0")
                  }
                />
                <Icone
                  size={16}
                  className={ativo ? "text-azureClaro" : "text-muted group-hover:text-corpo"}
                />
                {item.rotulo}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex h-14 items-center gap-2.5 px-4">
      <LogoB7 altura={18} className="shrink-0" />
      <span aria-hidden className="h-4 w-px shrink-0 bg-lineForte" />
      <span className="truncate text-sm font-bold">
        <span className="grad">Central</span> de Conteúdo
      </span>
    </div>
  );
}


function iniciais(texto: string) {
  const partes = texto.trim().split(/[\s@._-]+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return (letras || texto.slice(0, 2) || "EM").toUpperCase();
}

function useMeuPerfil() {
  const buscarPerfil = useServerFn(obterMeuPerfil);
  return useQuery({ queryKey: ["meu-perfil"], queryFn: () => buscarPerfil() });
}

function Avatar({ nome }: { nome: string }) {
  return (
    <div
      title={nome}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-azure/15 text-xs font-bold text-azureClaro"
    >
      {iniciais(nome)}
    </div>
  );
}

function BlocoUsuario() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useMeuPerfil();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-line px-3 py-3">
      <Avatar nome={data?.nome ?? "EM"} />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-txt">{data?.nome ?? "Minha conta"}</p>
        <p className="truncate text-[.7rem] text-muted">Conta conectada</p>
      </div>

      <button
        className="btn-fantasma min-h-11 min-w-11 justify-center"
        onClick={() => void sair()}
        aria-label="Sair da conta"
        title="Sair"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const atual = TODOS.find((n) => n.to === pathname);
  const noPost = pathname.startsWith("/post/");
  const titulo = atual?.rotulo ?? (noPost ? "Post" : "Painel");
  const subtitulo = atual?.subtitulo ?? (noPost ? "Edição, versões e aprovação" : "");
  const { data: perfil } = useMeuPerfil();

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh overflow-x-clip">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-bg2 lg:flex">
        <Marca />
        <div className="flex-1 overflow-y-auto">
          <Navegacao />
        </div>
        <BlocoUsuario />
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setAberto(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-bg2 shadow-[var(--sombra-2)]">
            <div className="flex items-center justify-between pr-3">
              <Marca />
              <button
                className="btn-fantasma min-h-11 min-w-11 justify-center"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Navegacao aoNavegar={() => setAberto(false)} />
            </div>
            <BlocoUsuario />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="btn-fantasma min-h-11 min-w-11 justify-center lg:hidden"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu"
            >
              <Menu size={16} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">{titulo}</p>
              {subtitulo ? (
                <p className="hidden truncate text-[.72rem] leading-tight text-muted sm:block">
                  {subtitulo}
                </p>
              ) : null}
            </div>
          </div>
          <div className="lg:hidden">
            <Avatar nome={perfil?.nome ?? "EM"} />
          </div>
        </header>

        <main className="px-4 py-5 lg:px-6">
          <div className="mx-auto max-w-[1500px] space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

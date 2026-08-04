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

const NAV = [
  { rotulo: "Painel", to: "/", icone: LayoutDashboard },
  { rotulo: "Calendário", to: "/calendario", icone: CalendarDays },
  { rotulo: "Kanban", to: "/kanban", icone: KanbanSquare },
  { rotulo: "Criar", to: "/criar", icone: PenLine },
  { rotulo: "Métricas", to: "/metricas", icone: BarChart3 },
  { rotulo: "Pautas", to: "/pautas", icone: Lightbulb },
  { rotulo: "Cérebro", to: "/cerebro", icone: Brain },
  { rotulo: "Reels Radar", to: "/radar", icone: Radar },
  { rotulo: "Ajustes", to: "/ajustes", icone: Settings },
] as const;

function Navegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const Icone = item.icone;
        const ativo = pathname === item.to;

        if ("desativado" in item && item.desativado) {
          return (
            <span
              key={item.to}
              title="Em breve"
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-2.5 rounded-[.5rem] px-3 py-2 text-sm text-muted opacity-45"
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
            className={
              "flex items-center gap-2.5 rounded-[.5rem] px-3 py-2 text-sm transition-colors " +
              (ativo
                ? "bg-azure/14 font-semibold text-white"
                : "text-muted hover:text-corpo")
            }
          >
            <Icone size={16} />
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex h-14 items-center px-4 font-bold">
      B7 · <span className="grad ml-1">Central</span>
      <span className="ml-1">de Conteúdo</span>
    </div>
  );
}

function iniciais(texto: string) {
  const partes = texto.trim().split(/[\s@._-]+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return (letras || texto.slice(0, 2) || "EM").toUpperCase();
}

function Usuario() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const buscarPerfil = useServerFn(obterMeuPerfil);
  const { data } = useQuery({ queryKey: ["meu-perfil"], queryFn: () => buscarPerfil() });

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex items-center gap-2">
      <div
        title={data?.nome || undefined}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-azure/15 text-xs font-bold text-azureClaro"
      >
        {iniciais(data?.nome ?? "EM")}
      </div>
      <button className="btn !p-1.5" onClick={() => void sair()} aria-label="Sair" title="Sair">
        <LogOut size={16} />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const titulo =
    NAV.find((n) => n.to === pathname)?.rotulo ??
    (pathname.startsWith("/post/") ? "Post" : "Painel");

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-clip">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-bg2 lg:block">
        <Marca />
        <Navegacao />
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setAberto(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-line bg-bg2">
            <div className="flex items-center justify-between pr-3">
              <Marca />
              <button className="btn !p-1.5" onClick={() => setAberto(false)} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <Navegacao aoNavegar={() => setAberto(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="flex h-14 items-center justify-between border-b border-line px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="btn !p-1.5 lg:hidden"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu"
            >
              <Menu size={16} />
            </button>
            <span className="text-sm font-semibold">{titulo}</span>
          </div>
          <Usuario />
        </header>

        <main className="px-4 py-5 lg:px-6">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

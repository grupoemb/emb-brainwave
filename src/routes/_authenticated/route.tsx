import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CarregandoTela } from "@/components/ui/CarregandoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  pendingComponent: () => <CarregandoTela rotulo="Abrindo a central…" />,
  errorComponent: ({ error, reset }) => (
    <div className="px-4 py-8">
      <EstadoVazio
        variante="erro"
        icone={<AlertTriangle size={16} />}
        titulo="Algo saiu do trilho"
        descricao={error instanceof Error ? error.message : "Erro inesperado ao carregar a tela."}
        acao={
          <button type="button" className="btn-primario px-3 py-1.5 text-xs" onClick={reset}>
            Tentar de novo
          </button>
        }
      />
    </div>
  ),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

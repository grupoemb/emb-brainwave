import { useQuery } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { normalizarContas, type ContaVisao } from "@/lib/contas";

export type PainelContasDados = {
  contas: ContaVisao[];
  ultimaColeta: string | null;
};

export function useContas() {
  const { organizationId } = useOrg();

  return useQuery<PainelContasDados>({
    queryKey: ["contas-overview", organizationId],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const [visao, coleta] = await Promise.all([
        supabase.rpc("accounts_overview", { p_org: organizationId! }),
        supabase
          .from("post_metrics")
          .select("captured_at")
          .order("captured_at", { ascending: false })
          .limit(1),
      ]);

      if (visao.error) throw new Error(visao.error.message);

      return {
        contas: normalizarContas(visao.data),
        ultimaColeta: coleta.data?.[0]?.captured_at ?? null,
      };
    },
  });
}

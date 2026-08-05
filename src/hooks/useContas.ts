import { useQuery } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizarContas,
  normalizarReels,
  type ContaVisao,
  type ReelProprio,
} from "@/lib/contas";

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

/** Ranking completo de reels de uma conta própria — só quando o drawer abre. */
export function useReelsDaConta(handle: string | null) {
  const { organizationId } = useOrg();

  return useQuery<ReelProprio[]>({
    queryKey: ["contas-reels", organizationId, handle],
    enabled: !!organizationId && !!handle,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("radar_own_reels", {
        p_org: organizationId!,
        p_handle: handle!,
      });
      if (error) throw new Error(error.message);
      return normalizarReels(data);
    },
  });
}

import { useQuery } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { normalizarReels, type ReelProprio } from "@/lib/contas";

/** Melhores reels de todas as contas próprias (radar_own_top_reels). */
export function useTopReels(limite = 12) {
  const { organizationId } = useOrg();

  return useQuery<ReelProprio[]>({
    queryKey: ["radar-top-reels", organizationId, limite],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("radar_own_top_reels", {
        p_org: organizationId!,
        p_limit: limite,
      });
      if (error) throw new Error(error.message);
      return normalizarReels(data);
    },
  });
}

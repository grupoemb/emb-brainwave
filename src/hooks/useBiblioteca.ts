import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { normalizarInsights, type ItemBiblioteca } from "@/lib/biblioteca";

export function useBiblioteca() {
  const { organizationId } = useOrg();

  const itens = useQuery({
    queryKey: ["biblioteca", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .eq("organization_id", organizationId!)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ItemBiblioteca[];
    },
  });

  const insights = useQuery({
    queryKey: ["biblioteca-insights", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_library_insights", {
        p_org: organizationId!,
      });
      if (error) throw error;
      return normalizarInsights(data);
    },
  });

  return {
    itens: itens.data ?? [],
    carregando: itens.isPending || !organizationId,
    insights: insights.data ?? null,
    carregandoInsights: insights.isPending || !organizationId,
  };
}

export function useRemoverItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["biblioteca"] });
      void qc.invalidateQueries({ queryKey: ["biblioteca-insights"] });
    },
  });
}

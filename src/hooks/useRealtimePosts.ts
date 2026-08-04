import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

/**
 * Mantém a lista de posts sincronizada em tempo real com o banco,
 * escutando alterações da organização atual.
 */
export function useRealtimePosts() {
  const { organizationId } = useOrg();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;

    const canal = supabase
      .channel(`posts-org-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["posts", organizationId] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [organizationId, queryClient]);
}

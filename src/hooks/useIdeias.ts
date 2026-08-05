import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";

export type Ideia = {
  id: string;
  organization_id: string;
  tipo: string;
  title: string;
  angle: string | null;
  rationale: string | null;
  based_on: string | null;
  handle: string | null;
  format: string | null;
  hook_type: string | null;
  pillar: string | null;
  status: string;
  created_at: string;
};

export function useIdeias() {
  const { organizationId } = useOrg();

  const q = useQuery({
    queryKey: ["ideias", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("organization_id", organizationId!)
        .neq("status", "dismissed")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Ideia[];
    },
  });

  return {
    ideias: q.data ?? [],
    carregando: q.isPending || !organizationId,
    erro: q.error instanceof Error ? q.error.message : null,
  };
}

export function useGerarIdeias() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organização não encontrada");
      const { data, error } = await supabase.functions.invoke("ideas", {
        body: { organization_id: organizationId, force: true },
      });
      if (error) throw new Error(error.message);
      return data as unknown;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ideias"] });
    },
  });
}

export function useStatusIdeia() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "saved" | "dismissed" | "new" }) => {
      const { error } = await supabase.from("ideas").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
      return { id, status };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ideias"] });
    },
  });
}

export function useVirarPauta() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (ideia: Ideia) => {
      if (!organizationId) throw new Error("Organização não encontrada");
      const { error } = await supabase.from("suggestions").insert({
        organization_id: organizationId,
        kind: "theme",
        title: ideia.title,
        rationale: ideia.rationale,
        suggested_channel: "instagram",
        suggested_format: (ideia.format ?? null) as never,
        priority: 60,
        status: "new",
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ideias"] });
      void qc.invalidateQueries({ queryKey: ["pautas"] });
      void qc.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });
}

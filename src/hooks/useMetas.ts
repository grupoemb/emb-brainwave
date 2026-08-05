import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { normalizarMetas, type Meta, type MetricaMeta, type ModoMeta } from "@/lib/metas";

export type FormularioMeta = {
  id?: string;
  metric: MetricaMeta;
  handle: string | null;
  mode: ModoMeta;
  target: number;
  start_date: string;
  end_date: string;
  label: string | null;
};

export function useMetas() {
  const { organizationId } = useOrg();

  const q = useQuery<Meta[]>({
    queryKey: ["metas", organizationId],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("goals_overview", { p_org: organizationId! });
      if (error) throw new Error(error.message);
      return normalizarMetas(data);
    },
  });

  return {
    metas: q.data ?? [],
    carregando: q.isPending || !organizationId,
    erro: q.error ? (q.error as Error).message : null,
  };
}

/** Perfis conectados, para o filtro e o dialog. */
export function usePerfisMeta() {
  const { organizationId } = useOrg();

  const q = useQuery<string[]>({
    queryKey: ["metas-perfis", organizationId],
    enabled: !!organizationId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("handle")
        .eq("organization_id", organizationId!)
        .order("handle");
      if (error) throw new Error(error.message);
      return [...new Set((data ?? []).map((c) => c.handle.toLowerCase()))];
    },
  });

  return q.data ?? [];
}

export function useSalvarMeta() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (f: FormularioMeta) => {
      if (!organizationId) throw new Error("organização não encontrada");
      const linha = {
        organization_id: organizationId,
        handle: f.handle,
        metric: f.metric,
        mode: f.mode,
        target: f.target,
        start_date: f.start_date,
        end_date: f.end_date,
        label: f.label,
      };
      const { error } = f.id
        ? await supabase.from("goals").update(linha).eq("id", f.id)
        : await supabase.from("goals").insert(linha);
      if (error) throw new Error(error.message);
      return f;
    },
    onSuccess: (f) => {
      void qc.invalidateQueries({ queryKey: ["metas", organizationId] });
      toast.success(f.id ? "Meta atualizada" : "Meta criada");
    },
    onError: (e: Error) => toast.error("Não deu pra salvar a meta", { description: e.message }),
  });
}

export function useExcluirMeta() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["metas", organizationId] });
      toast.success("Meta excluída");
    },
    onError: (e: Error) => toast.error("Não deu pra excluir a meta", { description: e.message }),
  });
}

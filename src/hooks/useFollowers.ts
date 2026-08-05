import { useQuery } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";

export type ContaSeguidores = {
  handle: string;
  followers: number | null;
  delta_7d: number | null;
  delta_30d: number | null;
};

export type ResumoSeguidores = {
  total: number | null;
  delta7d: number | null;
  contas: ContaSeguidores[];
};

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizar(bruto: unknown): ResumoSeguidores {
  const o = (bruto ?? {}) as Record<string, unknown>;
  const lista = Array.isArray(o["contas"]) ? (o["contas"] as unknown[]) : [];

  const contas: ContaSeguidores[] = lista.map((c) => {
    const x = (c ?? {}) as Record<string, unknown>;
    return {
      handle: String(x["handle"] ?? "").replace(/^@/, ""),
      followers: num(x["followers"]),
      delta_7d: num(x["delta_7d"]),
      delta_30d: num(x["delta_30d"]),
    };
  });

  const somaSeguidores = contas.reduce((s, c) => s + (c.followers ?? 0), 0);
  const total = num(o["total"]) ?? (contas.length ? somaSeguidores : null);

  const com7d = contas.filter((c) => c.delta_7d !== null);
  const delta7d =
    num(o["delta_7d"]) ?? (com7d.length ? com7d.reduce((s, c) => s + (c.delta_7d ?? 0), 0) : null);

  return { total, delta7d, contas };
}

/** Seguidores consolidados da organização (RPC followers_overview). */
export function useFollowers() {
  const { organizationId } = useOrg();

  return useQuery<ResumoSeguidores>({
    queryKey: ["followers-overview", organizationId],
    enabled: !!organizationId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("followers_overview", {
        p_org: organizationId!,
      });
      if (error) throw new Error(error.message);
      return normalizar(data);
    },
  });
}

import { useQuery } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import type { ReelRanking } from "@/lib/ranking";

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function normalizar(bruto: unknown): ReelRanking[] {
  const lista = Array.isArray(bruto) ? bruto : [];
  return lista.map((r, i) => {
    const x = (r ?? {}) as Record<string, unknown>;
    return {
      handle: (texto(x["handle"]) ?? "perfil").replace(/^@/, ""),
      id: texto(x["id"]) ?? `reel-${i}`,
      url: texto(x["url"]),
      caption: texto(x["caption"]),
      published_at: texto(x["published_at"]),
      plays: num(x["plays"]),
      reach: num(x["reach"]),
      saves: num(x["saves"]),
      shares: num(x["shares"]),
      comments: num(x["comments"]),
      likes: num(x["likes"]),
      reach_rate: num(x["reach_rate"]),
      shares_pr: num(x["shares_pr"]),
      saves_pr: num(x["saves_pr"]),
      eng_pr: num(x["eng_pr"]),
      vx: num(x["vx"]),
      score: num(x["score"]),
      lever: texto(x["lever"]),
      lever_pct: num(x["lever_pct"]),
      hook: texto(x["hook"]),
      theme: texto(x["theme"]),
      intent: texto(x["intent"]),
      rank_geral: num(x["rank_geral"]),
      rank_perfil: num(x["rank_perfil"]),
    };
  });
}

/** Ranking de reels por qualidade de crescimento (RPC radar_ranking). */
export function useRanking(dias = 90) {
  const { organizationId } = useOrg();

  return useQuery<ReelRanking[]>({
    queryKey: ["radar-ranking", organizationId, dias],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("radar_ranking", {
        p_org: organizationId!,
        p_dias: dias,
      });
      if (error) throw new Error(error.message);
      return normalizar(data);
    },
  });
}

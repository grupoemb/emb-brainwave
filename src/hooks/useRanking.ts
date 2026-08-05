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

/**
 * Ranking de reels por qualidade de crescimento.
 * Consome a RPC radar_ranking(p_org, p_dias, p_handle) — RLS por organização.
 */
export function useRanking(dias = 90, handle: string | null = null) {
  const { organizationId } = useOrg();

  return useQuery<ReelRanking[]>({
    queryKey: ["radar-ranking", organizationId, dias, handle],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("radar_ranking", {
        p_org: organizationId!,
        p_dias: dias,
        p_handle: handle,
      } as never);
      if (error) throw new Error(error.message);

      const linhas = (data ?? []) as unknown as Record<string, unknown>[];

      return linhas.map((l) => ({
        handle: (texto(l["handle"]) ?? "perfil").replace(/^@/, ""),
        id: texto(l["id"]) ?? "",
        url: texto(l["url"]),
        caption: texto(l["caption"]),
        published_at: texto(l["published_at"]),
        plays: num(l["plays"]),
        reach: num(l["reach"]),
        saves: num(l["saves"]),
        shares: num(l["shares"]),
        comments: num(l["comments"]),
        likes: num(l["likes"]),
        reach_rate: num(l["reach_rate"]),
        shares_pr: num(l["shares_pr"]),
        saves_pr: num(l["saves_pr"]),
        eng_pr: num(l["eng_pr"]),
        vx: num(l["vx"]),
        score: num(l["score"]),
        lever: texto(l["lever"]),
        lever_pct: num(l["lever_pct"]),
        hook: texto(l["hook"]),
        theme: texto(l["theme"]),
        intent: texto(l["intent"]),
        rank_geral: num(l["rank_geral"]),
        rank_perfil: num(l["rank_perfil"]),
        watch_s: num(l["watch_s"]),
        hook_pct: num(l["hook_pct"]),
      }));
    },
  });
}

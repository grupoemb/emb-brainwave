import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const entrada = z.object({
  organizationId: z.string().uuid(),
  dias: z.union([z.literal(7), z.literal(30), z.literal(90)]),
  /** Intervalo explícito (usado no modo de comparação). */
  desde: z.string().optional(),
  ate: z.string().optional(),
});


/** Contas sociais já conectadas (connected_at preenchido). */
export const listarContasConectadas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ organizationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("social_accounts")
      .select("id, handle, channel, connected_at")
      .eq("organization_id", data.organizationId)
      .not("connected_at", "is", null)
      .order("handle");

    if (error) throw new Error(error.message);
    return (linhas ?? []) as {
      id: string;
      handle: string;
      channel: string;
      connected_at: string;
    }[];
  });

/**
 * Posts publicados no Instagram dentro do período + leituras de post_metrics
 * (ordenadas por captured_at desc, deduplicadas no cliente) + baselines.
 */
export const carregarMetricas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => entrada.parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const desde = new Date(Date.now() - data.dias * 86_400_000).toISOString();

    const { data: linhasPosts, error: erroPosts } = await db
      .from("posts")
      .select("id, title, channel, format, pillar_id, published_at, meta")
      .eq("organization_id", data.organizationId)
      .eq("status", "published")
      .eq("channel", "instagram")
      .gte("published_at", desde)
      .order("published_at", { ascending: false })
      .limit(1000);

    if (erroPosts) throw new Error(erroPosts.message);

    const posts = ((linhasPosts ?? []) as Record<string, unknown>[]).map((p) => ({
      id: p['id'] as string,
      title: (p['title'] ?? "") as string,
      channel: (p['channel'] ?? null) as string | null,
      format: (p['format'] ?? null) as string | null,
      pillar_id: (p['pillar_id'] ?? null) as string | null,
      published_at: (p['published_at'] ?? null) as string | null,
      source_handle:
        ((p['meta'] as Record<string, unknown> | null)?.['source_handle'] ?? null) as string | null,
    }));

    const ids = posts.map((p) => p.id);
    let leituras: {
      post_id: string;
      captured_at: string;
      reach: number | null;
      impressions: number | null;
      likes: number | null;
      comments: number | null;
      shares: number | null;
      saves: number | null;
    }[] = [];

    if (ids.length) {
      const { data: linhasM, error: erroM } = await db
        .from("post_metrics")
        .select("post_id, captured_at, reach, impressions, likes, comments, shares, saves")
        .in("post_id", ids)
        .order("captured_at", { ascending: false })
        .limit(5000);

      if (erroM) throw new Error(erroM.message);
      leituras = (linhasM ?? []) as typeof leituras;
    }

    const { data: linhasB, error: erroB } = await db
      .from("metric_baselines")
      .select("channel, format, metric, median_value")
      .eq("organization_id", data.organizationId);

    if (erroB) throw new Error(erroB.message);

    const { data: qualquer, error: erroQ } = await db
      .from("post_metrics")
      .select("captured_at")
      .order("captured_at", { ascending: false })
      .limit(1);

    if (erroQ) throw new Error(erroQ.message);

    return {
      posts,
      leituras,
      baselines: (linhasB ?? []) as {
        channel: string;
        format: string;
        metric: string;
        median_value: number | null;
      }[],
      houveColeta: ((qualquer ?? []) as unknown[]).length > 0,
    };
  });

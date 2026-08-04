import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TipoSugestao = "theme" | "improvement" | "format" | "timing" | "pillar_alert";
export type StatusSugestao = "new" | "accepted" | "dismissed";

export type Sugestao = {
  id: string;
  kind: TipoSugestao;
  title: string;
  rationale: string | null;
  suggested_channel: string | null;
  suggested_format: string | null;
  pillar_id: string | null;
  pilar_nome: string | null;
  pilar_cor: string | null;
  priority: number;
  status: string;
  converted_post_id: string | null;
  created_at: string;
  /** trilha do loop */
  post_status: string | null;
  publicada: boolean;
  rx: number | null;
};

const orgInput = z.object({ organizationId: z.string().uuid() });

export const listarSugestoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgInput.parse(input))
  .handler(async ({ data, context }): Promise<{ sugestoes: Sugestao[]; ultimaRodada: string | null }> => {
    const db = context.supabase as unknown as SupabaseClient;

    const { data: linhas, error } = await db
      .from("suggestions")
      .select(
        "id, kind, title, rationale, suggested_channel, suggested_format, pillar_id, priority, status, converted_post_id, created_at",
      )
      .eq("organization_id", data.organizationId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    const sugs = (linhas ?? []) as Record<string, unknown>[];

    const { data: pilaresRaw } = await db
      .from("content_pillars")
      .select("id, name, color")
      .eq("organization_id", data.organizationId);
    const pilares = new Map(
      ((pilaresRaw ?? []) as { id: string; name: string; color: string | null }[]).map((p) => [
        p.id,
        p,
      ]),
    );

    const postIds = sugs
      .map((s) => s["converted_post_id"] as string | null)
      .filter((v): v is string => !!v);

    const posts = new Map<string, { status: string; channel: string | null; format: string | null }>();
    const rxPorPost = new Map<string, number | null>();

    if (postIds.length) {
      const { data: postsRaw } = await db
        .from("posts")
        .select("id, status, channel, format")
        .in("id", postIds);
      for (const p of (postsRaw ?? []) as Record<string, unknown>[]) {
        posts.set(p["id"] as string, {
          status: p["status"] as string,
          channel: (p["channel"] ?? null) as string | null,
          format: (p["format"] ?? null) as string | null,
        });
      }

      const { data: leiturasRaw } = await db
        .from("post_metrics")
        .select("post_id, reach, captured_at")
        .in("post_id", postIds)
        .order("captured_at", { ascending: false });

      const ultima = new Map<string, number | null>();
      for (const l of (leiturasRaw ?? []) as Record<string, unknown>[]) {
        const pid = l["post_id"] as string;
        if (!ultima.has(pid)) ultima.set(pid, (l["reach"] ?? null) as number | null);
      }

      const { data: baseRaw } = await db
        .from("metric_baselines")
        .select("channel, format, metric, median_value")
        .eq("organization_id", data.organizationId)
        .eq("metric", "reach");
      const baselines = (baseRaw ?? []) as {
        channel: string;
        format: string;
        median_value: number | null;
      }[];

      for (const [pid, post] of posts) {
        const reach = ultima.get(pid) ?? null;
        const base = baselines.find((b) => b.channel === post.channel && b.format === post.format);
        const mediana = base?.median_value && base.median_value > 0 ? base.median_value : null;
        rxPorPost.set(pid, reach !== null && mediana !== null ? reach / mediana : null);
      }
    }

    const sugestoes: Sugestao[] = sugs.map((s) => {
      const pid = (s["converted_post_id"] ?? null) as string | null;
      const post = pid ? (posts.get(pid) ?? null) : null;
      const pilar = s["pillar_id"] ? (pilares.get(s["pillar_id"] as string) ?? null) : null;
      return {
        id: s["id"] as string,
        kind: s["kind"] as TipoSugestao,
        title: s["title"] as string,
        rationale: (s["rationale"] ?? null) as string | null,
        suggested_channel: (s["suggested_channel"] ?? null) as string | null,
        suggested_format: (s["suggested_format"] ?? null) as string | null,
        pillar_id: (s["pillar_id"] ?? null) as string | null,
        pilar_nome: pilar?.name ?? null,
        pilar_cor: pilar?.color ?? null,
        priority: Number(s["priority"] ?? 0),
        status: s["status"] as string,
        converted_post_id: pid,
        created_at: s["created_at"] as string,
        post_status: post?.status ?? null,
        publicada: post?.status === "published",
        rx: pid ? (rxPorPost.get(pid) ?? null) : null,
      };
    });

    const ultimaRodada =
      sugestoes.reduce<string | null>(
        (max, s) => (!max || s.created_at > max ? s.created_at : max),
        null,
      ) ?? null;

    return { sugestoes, ultimaRodada };
  });

export const aceitarSugestao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    orgInput.extend({ suggestionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;

    const { data: sugRaw, error: erroSug } = await db
      .from("suggestions")
      .select("id, title, suggested_channel, suggested_format, pillar_id, converted_post_id")
      .eq("id", data.suggestionId)
      .eq("organization_id", data.organizationId)
      .maybeSingle();

    if (erroSug) throw new Error(erroSug.message);
    if (!sugRaw) throw new Error("Pauta não encontrada.");
    const sug = sugRaw as Record<string, unknown>;

    if (sug["converted_post_id"]) return { id: sug["converted_post_id"] as string };

    const { data: criado, error } = await db
      .from("posts")
      .insert({
        organization_id: data.organizationId,
        title: sug["title"] as string,
        status: "idea",
        channel: (sug["suggested_channel"] ?? null) as string | null,
        format: (sug["suggested_format"] ?? null) as string | null,
        pillar_id: (sug["pillar_id"] ?? null) as string | null,
        suggestion_id: data.suggestionId,
        author_id: context.userId,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    const postId = (criado as { id: string }).id;

    const { error: erroUp } = await db
      .from("suggestions")
      .update({ status: "accepted", converted_post_id: postId })
      .eq("id", data.suggestionId)
      .eq("organization_id", data.organizationId);

    if (erroUp) throw new Error(erroUp.message);
    return { id: postId };
  });

export const descartarSugestao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    orgInput.extend({ suggestionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("suggestions")
      .update({ status: "dismissed" })
      .eq("id", data.suggestionId)
      .eq("organization_id", data.organizationId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type Insight = {
  id: string;
  statement: string;
  evidencia: string | null;
  strength: number;
  status: "active" | "weakening" | "refuted";
  first_seen_at: string;
};

export const obterCerebro = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgInput.parse(input))
  .handler(
    async ({ data, context }): Promise<{ playbook: string | null; insights: Insight[]; ultimaAnalise: string | null }> => {
      const db = context.supabase as unknown as SupabaseClient;

      const { data: marca, error: erroMarca } = await db
        .from("brand_profiles")
        .select("playbook")
        .eq("organization_id", data.organizationId)
        .limit(1)
        .maybeSingle();
      if (erroMarca) throw new Error(erroMarca.message);

      const { data: linhas, error } = await db
        .from("insights")
        .select("id, statement, evidence, strength, status, first_seen_at")
        .eq("organization_id", data.organizationId)
        .order("strength", { ascending: false });
      if (error) throw new Error(error.message);

      const insights: Insight[] = ((linhas ?? []) as Record<string, unknown>[]).map((i) => {
        const ev = (i["evidence"] ?? null) as Record<string, unknown> | null;
        const resumo = ev && typeof ev["summary"] === "string" ? (ev["summary"] as string) : null;
        return {
          id: i["id"] as string,
          statement: i["statement"] as string,
          evidencia: resumo,
          strength: Number(i["strength"] ?? 0),
          status: (i["status"] ?? "active") as Insight["status"],
          first_seen_at: i["first_seen_at"] as string,
        };
      });

      const ultimaAnalise = insights.reduce<string | null>(
        (max, i) => (!max || i.first_seen_at > max ? i.first_seen_at : max),
        null,
      );

      return {
        playbook: ((marca as { playbook: string | null } | null)?.playbook ?? null) || null,
        insights,
        ultimaAnalise,
      };
    },
  );

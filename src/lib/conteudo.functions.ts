import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CANAIS = ["instagram", "linkedin", "tiktok", "youtube"] as const;
const FORMATOS = [
  "reel",
  "carousel",
  "image",
  "story",
  "video_long",
  "short",
  "text",
  "article",
  "other",
] as const;
const STATUS = [
  "idea",
  "script",
  "design",
  "review",
  "approved",
  "scheduled",
  "published",
  "archived",
] as const;

export const obterMinhaOrganizacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data, error } = await db
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", context.userId)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const linha = data as { organization_id: string; role: string } | null;
    return {
      organizationId: linha?.organization_id ?? null,
      papel: linha?.role ?? null,
    };
  });

export const listarPilares = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ organizationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("content_pillars")
      .select("id, name, color")
      .eq("organization_id", data.organizationId)
      .order("name");

    if (error) throw new Error(error.message);
    return (linhas ?? []) as { id: string; name: string; color: string | null }[];
  });

export const listarPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ organizationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("posts")
      .select(
        "id, title, status, channel, format, pillar_id, author_id, suggestion_id, scheduled_for, published_at, created_at",
      )
      .eq("organization_id", data.organizationId)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw new Error(error.message);

    const posts = (linhas ?? []) as Record<string, unknown>[];
    const ids = Array.from(
      new Set(posts.map((p) => p['author_id'] as string | null).filter(Boolean) as string[]),
    );

    let nomes = new Map<string, string | null>();
    if (ids.length) {
      const { data: perfis } = await db.from("profiles").select("id, full_name").in("id", ids);
      nomes = new Map(
        ((perfis ?? []) as { id: string; full_name: string | null }[]).map((p) => [
          p.id,
          p.full_name,
        ]),
      );
    }

    return posts.map((p) => ({
      id: p['id'] as string,
      title: p['title'] as string,
      status: p['status'] as (typeof STATUS)[number],
      channel: (p['channel'] ?? null) as (typeof CANAIS)[number] | null,
      format: (p['format'] ?? null) as (typeof FORMATOS)[number] | null,
      pillar_id: (p['pillar_id'] ?? null) as string | null,
      author_id: (p['author_id'] ?? null) as string | null,
      suggestion_id: (p['suggestion_id'] ?? null) as string | null,
      scheduled_for: (p['scheduled_for'] ?? null) as string | null,
      published_at: (p['published_at'] ?? null) as string | null,
      autor_nome: nomes.get((p['author_id'] ?? "") as string) ?? null,
    }));
  });

export const criarPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        organizationId: z.string().uuid(),
        title: z.string().trim().min(1, "Informe um título").max(200),
        channel: z.enum(CANAIS).nullable(),
        format: z.enum(FORMATOS).nullable(),
        pillar_id: z.string().uuid().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: criado, error } = await db
      .from("posts")
      .insert({
        organization_id: data.organizationId,
        title: data.title,
        status: "idea",
        channel: data.channel,
        format: data.format,
        pillar_id: data.pillar_id,
        author_id: context.userId,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: (criado as { id: string }).id };
  });

export const atualizarStatusPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(STATUS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;

    if (data.status === "approved" || data.status === "scheduled") {
      const { data: aprovacao, error: erroAprov } = await db
        .from("approvals")
        .select("id")
        .eq("post_id", data.id)
        .eq("decision", "approved")
        .limit(1)
        .maybeSingle();

      if (erroAprov) throw new Error(erroAprov.message);
      if (!aprovacao) return { ok: false as const, motivo: "sem_aprovacao" as const };
    }

    const { error } = await db.from("posts").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const atualizarAgendamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), scheduled_for: z.string().datetime().nullable() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("posts")
      .update({ scheduled_for: data.scheduled_for })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const excluirPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

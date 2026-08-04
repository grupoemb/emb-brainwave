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

const HOOKS = [
  "question",
  "bold_claim",
  "story",
  "stat",
  "contrarian",
  "list",
  "news",
  "how_to",
  "other",
] as const;

export const obterPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linha, error } = await db
      .from("posts")
      .select(
        "id, organization_id, title, status, channel, format, hook, pillar_id, body, author_id, suggestion_id, scheduled_for, published_at, meta, created_at, updated_at",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!linha) return null;
    const p = linha as Record<string, unknown>;
    return {
      id: p['id'] as string,
      organization_id: p['organization_id'] as string,
      title: p['title'] as string,
      status: p['status'] as (typeof STATUS)[number],
      channel: (p['channel'] ?? null) as (typeof CANAIS)[number] | null,
      format: (p['format'] ?? null) as (typeof FORMATOS)[number] | null,
      hook: (p['hook'] ?? null) as (typeof HOOKS)[number] | null,
      pillar_id: (p['pillar_id'] ?? null) as string | null,
      body: (p['body'] ?? null) as string | null,
      author_id: (p['author_id'] ?? null) as string | null,
      suggestion_id: (p['suggestion_id'] ?? null) as string | null,
      scheduled_for: (p['scheduled_for'] ?? null) as string | null,
      published_at: (p['published_at'] ?? null) as string | null,
      cta: (((p['meta'] ?? {}) as Record<string, unknown>)['cta'] ?? null) as string | null,
      source_handle: (((p['meta'] ?? {}) as Record<string, unknown>)['source_handle'] ?? null) as
        | string
        | null,
      updated_at: (p['updated_at'] ?? null) as string | null,
    };
  });

export const atualizarPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        campos: z.object({
          title: z.string().trim().min(1).max(200).optional(),
          body: z.string().nullable().optional(),
          channel: z.enum(CANAIS).nullable().optional(),
          format: z.enum(FORMATOS).nullable().optional(),
          hook: z.enum(HOOKS).nullable().optional(),
          pillar_id: z.string().uuid().nullable().optional(),
          scheduled_for: z.string().datetime().nullable().optional(),
          cta: z.string().nullable().optional(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { cta, ...resto } = data.campos;
    const patch: Record<string, unknown> = { ...resto };

    if (cta !== undefined) {
      const { data: atual, error: erroAtual } = await db
        .from("posts")
        .select("meta")
        .eq("id", data.id)
        .maybeSingle();
      if (erroAtual) throw new Error(erroAtual.message);
      const meta = ((atual as { meta: Record<string, unknown> | null } | null)?.meta ??
        {}) as Record<string, unknown>;
      patch['meta'] = { ...meta, cta };
    }

    if (Object.keys(patch).length === 0) return { ok: true as const };

    const { error } = await db.from("posts").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listarVersoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ postId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("post_versions")
      .select("id, version_no, body, created_by, created_at")
      .eq("post_id", data.postId)
      .order("version_no", { ascending: false });

    if (error) throw new Error(error.message);
    const lista = (linhas ?? []) as {
      id: string;
      version_no: number;
      body: string | null;
      created_by: string | null;
      created_at: string;
    }[];
    const idsPerfis = Array.from(
      new Set(lista.map((x) => x.created_by).filter(Boolean) as string[]),
    );
    let nomes = new Map<string, string | null>();
    if (idsPerfis.length) {
      const { data: perfis } = await db.from("profiles").select("id, full_name").in("id", idsPerfis);
      nomes = new Map(
        ((perfis ?? []) as { id: string; full_name: string | null }[]).map((x) => [
          x.id,
          x.full_name,
        ]),
      );
    }
    return lista.map((v) => ({ ...v, autor_nome: nomes.get(v.created_by ?? "") ?? null }));
  });

export const criarVersao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ postId: z.string().uuid(), body: z.string().nullable() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;

    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const { data: ultima, error: erroUltima } = await db
        .from("post_versions")
        .select("version_no")
        .eq("post_id", data.postId)
        .order("version_no", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (erroUltima) throw new Error(erroUltima.message);

      const proximo = ((ultima as { version_no: number } | null)?.version_no ?? 0) + 1;
      const { error } = await db.from("post_versions").insert({
        post_id: data.postId,
        version_no: proximo,
        body: data.body,
        created_by: context.userId,
      });

      if (!error) return { ok: true as const, version_no: proximo };
      if (tentativa === 2) throw new Error(error.message);
    }
    return { ok: false as const, version_no: 0 };
  });

export const listarAprovacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ postId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("approvals")
      .select("id, decision, note, reviewer_id, created_at")
      .eq("post_id", data.postId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    const lista = (linhas ?? []) as {
      id: string;
      decision: string;
      note: string | null;
      reviewer_id: string | null;
      created_at: string;
    }[];
    const idsPerfis = Array.from(
      new Set(lista.map((x) => x.reviewer_id).filter(Boolean) as string[]),
    );
    let nomes = new Map<string, string | null>();
    if (idsPerfis.length) {
      const { data: perfis } = await db.from("profiles").select("id, full_name").in("id", idsPerfis);
      nomes = new Map(
        ((perfis ?? []) as { id: string; full_name: string | null }[]).map((x) => [
          x.id,
          x.full_name,
        ]),
      );
    }
    return lista.map((a) => ({ ...a, revisor_nome: nomes.get(a.reviewer_id ?? "") ?? null }));
  });

export const criarAprovacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        postId: z.string().uuid(),
        decision: z.enum(["approved", "changes_requested", "rejected"]),
        note: z.string().trim().max(1000).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db.from("approvals").insert({
      post_id: data.postId,
      reviewer_id: context.userId,
      decision: data.decision,
      note: data.note,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listarAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ postId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("post_assets")
      .select("id, storage_path, kind, created_at")
      .eq("post_id", data.postId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    const lista = (linhas ?? []) as {
      id: string;
      storage_path: string;
      kind: string | null;
      created_at: string;
    }[];

    const assinados = await Promise.all(
      lista.map(async (a) => {
        const { data: url } = await db.storage
          .from("post-assets")
          .createSignedUrl(a.storage_path, 60 * 60);

        let thumb: string | null = null;
        if (a.kind === "image") {
          const { data: t } = await db.storage
            .from("post-assets")
            .createSignedUrl(a.storage_path, 60 * 60, {
              transform: { width: 240, height: 240, resize: "cover", quality: 40 },
            });
          thumb = t?.signedUrl ?? null;
        }

        return { ...a, url: url?.signedUrl ?? null, thumb };
      }),
    );
    return assinados;
  });


export const registrarAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        postId: z.string().uuid(),
        storage_path: z.string().min(1).max(500),
        kind: z.enum(["image", "video", "pdf", "other"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db.from("post_assets").insert({
      post_id: data.postId,
      storage_path: data.storage_path,
      kind: data.kind,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removerAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db.from("post_assets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

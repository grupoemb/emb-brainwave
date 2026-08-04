import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PAPEIS = ["owner", "admin", "editor", "writer", "reviewer", "viewer"] as const;
export type Papel = (typeof PAPEIS)[number];

export type Membro = {
  userId: string;
  nome: string;
  papel: Papel;
  desde: string;
};

export type ContaSocial = {
  id: string;
  channel: string;
  handle: string;
  connected_at: string | null;
  is_active: boolean;
  ultimaColeta: string | null;
};

export type Marca = {
  id: string | null;
  name: string;
  voice: string;
  audience: string;
  guidelines: string;
};

export type Pilar = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
};

export type Template = {
  id: string;
  kind: string;
  title: string;
  system_prompt: string;
  version: number;
  is_active: boolean;
};

const orgSchema = z.object({ organizationId: z.string().uuid() });

/* ------------------------------- EQUIPE ------------------------------- */

export const listarMembros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgSchema.parse(input))
  .handler(async ({ data, context }): Promise<Membro[]> => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("organization_members")
      .select("user_id, role, created_at, profiles(full_name)")
      .eq("organization_id", data.organizationId)
      .order("created_at");

    if (error) throw new Error(error.message);
    return ((linhas ?? []) as Record<string, unknown>[]).map((m) => {
      const perfil = m["profiles"] as { full_name: string | null } | null;
      return {
        userId: m["user_id"] as string,
        nome: perfil?.full_name?.trim() || "Sem nome",
        papel: m["role"] as Papel,
        desde: m["created_at"] as string,
      };
    });
  });

export const definirPapelMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    orgSchema.extend({ userId: z.string().uuid(), papel: z.enum(PAPEIS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("organization_members")
      .update({ role: data.papel })
      .eq("organization_id", data.organizationId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removerMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgSchema.extend({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("organization_members")
      .delete()
      .eq("organization_id", data.organizationId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- CONTAS ------------------------------- */

export const listarContasSociais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgSchema.parse(input))
  .handler(async ({ data, context }): Promise<ContaSocial[]> => {
    const db = context.supabase as unknown as SupabaseClient;

    const { data: contas, error } = await db
      .from("social_accounts")
      .select("id, channel, handle, connected_at, is_active")
      .eq("organization_id", data.organizationId)
      .order("handle");
    if (error) throw new Error(error.message);

    const { data: posts, error: erroPosts } = await db
      .from("posts")
      .select("id, meta")
      .eq("organization_id", data.organizationId)
      .limit(1000);
    if (erroPosts) throw new Error(erroPosts.message);

    const handlePorPost = new Map<string, string>();
    for (const p of (posts ?? []) as Record<string, unknown>[]) {
      const meta = (p["meta"] ?? null) as Record<string, unknown> | null;
      const h = meta && typeof meta["source_handle"] === "string" ? meta["source_handle"] : null;
      if (h) handlePorPost.set(p["id"] as string, h);
    }

    const ultimaPorHandle = new Map<string, string>();
    const ids = [...handlePorPost.keys()];
    if (ids.length) {
      const { data: leituras, error: erroLeituras } = await db
        .from("post_metrics")
        .select("post_id, captured_at")
        .in("post_id", ids)
        .order("captured_at", { ascending: false })
        .limit(2000);
      if (erroLeituras) throw new Error(erroLeituras.message);

      for (const l of (leituras ?? []) as { post_id: string; captured_at: string }[]) {
        const h = handlePorPost.get(l.post_id);
        if (!h) continue;
        const atual = ultimaPorHandle.get(h);
        if (!atual || l.captured_at > atual) ultimaPorHandle.set(h, l.captured_at);
      }
    }

    return ((contas ?? []) as Record<string, unknown>[]).map((c) => {
      const handle = c["handle"] as string;
      return {
        id: c["id"] as string,
        channel: c["channel"] as string,
        handle,
        connected_at: (c["connected_at"] ?? null) as string | null,
        is_active: Boolean(c["is_active"]),
        ultimaColeta: ultimaPorHandle.get(handle) ?? ultimaPorHandle.get(`@${handle}`) ?? null,
      };
    });
  });

export const alternarContaAtiva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), ativa: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("social_accounts")
      .update({ is_active: data.ativa })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------- MARCA & PILARES --------------------------- */

export const obterMarca = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgSchema.parse(input))
  .handler(async ({ data, context }): Promise<Marca> => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linha, error } = await db
      .from("brand_profiles")
      .select("id, name, voice, audience, guidelines")
      .eq("organization_id", data.organizationId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const m = linha as Record<string, unknown> | null;
    return {
      id: (m?.["id"] ?? null) as string | null,
      name: (m?.["name"] as string) ?? "Marca",
      voice: (m?.["voice"] as string) ?? "",
      audience: (m?.["audience"] as string) ?? "",
      guidelines: (m?.["guidelines"] as string) ?? "",
    };
  });

export const salvarMarca = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    orgSchema
      .extend({
        id: z.string().uuid().nullable(),
        name: z.string().trim().min(1).max(120),
        voice: z.string().max(4000),
        audience: z.string().max(4000),
        guidelines: z.string().max(8000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const campos = {
      name: data.name,
      voice: data.voice || null,
      audience: data.audience || null,
      guidelines: data.guidelines || null,
    };

    if (data.id) {
      const { error } = await db.from("brand_profiles").update(campos).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }

    const { data: criada, error } = await db
      .from("brand_profiles")
      .insert({ organization_id: data.organizationId, ...campos })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: (criada as { id: string }).id };
  });

export const listarPilaresCompletos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgSchema.parse(input))
  .handler(async ({ data, context }): Promise<Pilar[]> => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("content_pillars")
      .select("id, name, description, color")
      .eq("organization_id", data.organizationId)
      .order("name");
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Pilar[];
  });

const pilarSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(80),
  description: z.string().max(500),
  color: z.string().max(20),
});

export const salvarPilar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    orgSchema.extend({ id: z.string().uuid().nullable() }).merge(pilarSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const campos = {
      name: data.name,
      description: data.description || null,
      color: data.color || null,
    };

    if (data.id) {
      const { error } = await db.from("content_pillars").update(campos).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await db
      .from("content_pillars")
      .insert({ organization_id: data.organizationId, ...campos });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removerPilar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db.from("content_pillars").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------- TEMPLATES IA ----------------------------- */

export const listarTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orgSchema.parse(input))
  .handler(async ({ data, context }): Promise<Template[]> => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data: linhas, error } = await db
      .from("prompt_templates")
      .select("id, kind, title, system_prompt, version, is_active")
      .eq("organization_id", data.organizationId)
      .order("kind");
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Template[];
  });

export const salvarTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        system_prompt: z.string().trim().min(1, "O prompt não pode ficar vazio").max(20000),
        is_active: z.boolean(),
        version: z.number().int(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("prompt_templates")
      .update({
        system_prompt: data.system_prompt,
        is_active: data.is_active,
        version: data.version + 1,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

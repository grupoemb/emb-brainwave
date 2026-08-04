import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Perfil = { id: string; nome: string; avatar_url: string | null };

export const obterMeuPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Perfil> => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data, error } = await db
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const linha = data as { id: string; full_name: string | null; avatar_url: string | null } | null;
    return {
      id: linha?.id ?? context.userId,
      nome: linha?.full_name ?? "",
      avatar_url: linha?.avatar_url ?? null,
    };
  });

const esquemaPerfil = z.object({
  nome: z.string().trim().min(1, "Informe um nome").max(80),
  avatar_url: z.string().trim().url("URL inválida").max(500).or(z.literal("")),
});

export const atualizarMeuPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => esquemaPerfil.parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { error } = await db
      .from("profiles")
      .upsert(
        { id: context.userId, full_name: data.nome, avatar_url: data.avatar_url || null },
        { onConflict: "id" },
      );

    if (error) throw new Error(error.message);
    return { ok: true };
  });

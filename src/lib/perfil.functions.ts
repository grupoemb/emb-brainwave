import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const obterMeuPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, nome, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? { id: context.userId, nome: "", avatar_url: null };
  });

const esquemaPerfil = z.object({
  nome: z.string().trim().min(1, "Informe um nome").max(80),
  avatar_url: z.string().trim().url("URL inválida").max(500).or(z.literal("")),
});

export const atualizarMeuPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => esquemaPerfil.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ nome: data.nome, avatar_url: data.avatar_url || null })
      .eq("id", context.userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

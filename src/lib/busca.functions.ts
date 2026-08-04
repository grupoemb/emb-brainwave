import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PostEncontrado = {
  id: string;
  title: string;
  status: string;
  channel: string | null;
  format: string | null;
  scheduled_for: string | null;
  published_at: string | null;
};

export type PautaEncontrada = {
  id: string;
  title: string;
  kind: string;
  status: string;
  converted_post_id: string | null;
};

/** Escapa curingas do operador ilike do PostgREST. */
function limpar(termo: string) {
  return termo.replace(/[%_,()]/g, " ").trim().slice(0, 80);
}

export const buscaGlobal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ organizationId: z.string().uuid(), termo: z.string() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ posts: PostEncontrado[]; pautas: PautaEncontrada[] }> => {
    const termo = limpar(data.termo);
    if (termo.length < 2) return { posts: [], pautas: [] };

    const db = context.supabase as unknown as SupabaseClient;
    const alvo = `%${termo}%`;

    const [posts, pautas] = await Promise.all([
      db
        .from("posts")
        .select("id, title, status, channel, format, scheduled_for, published_at")
        .eq("organization_id", data.organizationId)
        .ilike("title", alvo)
        .order("created_at", { ascending: false })
        .limit(8),
      db
        .from("suggestions")
        .select("id, title, kind, status, converted_post_id")
        .eq("organization_id", data.organizationId)
        .or(`title.ilike.${alvo},rationale.ilike.${alvo}`)
        .order("priority", { ascending: false })
        .limit(8),
    ]);

    if (posts.error) throw new Error(posts.error.message);
    if (pautas.error) throw new Error(pautas.error.message);

    return {
      posts: (posts.data ?? []) as PostEncontrado[],
      pautas: (pautas.data ?? []) as PautaEncontrada[],
    };
  });

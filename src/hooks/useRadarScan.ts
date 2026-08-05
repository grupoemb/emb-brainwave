import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { normalizarScan, type ReelColetado, type RespostaScan } from "@/lib/radar";

export type ErroScan = { status: number | null; mensagem: string };

/** Lê status e mensagem real de um erro do functions.invoke. */
async function lerErro(erro: unknown): Promise<ErroScan> {
  const ctx = (erro as { context?: unknown })?.context;
  const base = erro instanceof Error ? erro.message : "Falha na coleta.";

  if (ctx instanceof Response) {
    let mensagem = base;
    try {
      const texto = await ctx.clone().text();
      try {
        const j = JSON.parse(texto) as Record<string, unknown>;
        const m = j["error"] ?? j["message"] ?? j["detail"];
        if (typeof m === "string" && m.trim()) mensagem = m;
        else if (texto.trim()) mensagem = texto.slice(0, 300);
      } catch {
        if (texto.trim()) mensagem = texto.slice(0, 300);
      }
    } catch {
      /* corpo indisponível */
    }
    return { status: ctx.status, mensagem };
  }

  return { status: null, mensagem: base };
}

export function useRadarScan() {
  const { organizationId } = useOrg();

  return useMutation<RespostaScan, ErroScan, string>({
    mutationFn: async (profileUrl: string) => {
      if (!organizationId) throw { status: null, mensagem: "Organização não encontrada." };
      const { data, error } = await supabase.functions.invoke("radar_scan", {
        body: { organization_id: organizationId, profile_url: profileUrl.trim() },
      });
      if (error) throw await lerErro(error);

      const o = (data ?? {}) as Record<string, unknown>;
      if (o["ok"] === false) {
        throw {
          status: null,
          mensagem:
            typeof o["error"] === "string" && o["error"]
              ? (o["error"] as string)
              : "Não foi possível coletar este perfil.",
        } satisfies ErroScan;
      }
      return normalizarScan(o);
    },
  });
}

export function useEnviarBiblioteca() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(null);

  const mutacao = useMutation({
    mutationFn: async ({
      reels,
      handle,
      nicho,
    }: {
      reels: ReelColetado[];
      handle: string;
      nicho: string;
    }) => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      let ok = 0;
      const falhas: string[] = [];

      for (let i = 0; i < reels.length; i++) {
        const r = reels[i]!;
        setProgresso({ atual: i + 1, total: reels.length });
        try {
          const { error } = await supabase.functions.invoke("library_add", {
            body: {
              organization_id: organizationId,
              url: r.url,
              external_id: r.id,
              creator_handle: handle,
              niche: nicho.trim() || null,
              views: r.views,
              vx: r.vx,
              duration_s: r.duration_s,
              cover_url: r.cover,
              caption: r.caption,
              source: "competitor",
            },
          });
          if (error) throw error;
          ok++;
        } catch {
          falhas.push(r.id);
        }
      }

      setProgresso(null);
      return { ok, falhas: falhas.length };
    },
    onSettled: () => {
      setProgresso(null);
      void qc.invalidateQueries({ queryKey: ["biblioteca"] });
      void qc.invalidateQueries({ queryKey: ["biblioteca-insights"] });
    },
  });

  return { ...mutacao, progresso };
}

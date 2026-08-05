import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, RefreshCw, Sparkles } from "lucide-react";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";

type Leitura = {
  leitura: string | null;
  padroes: string[];
  recomendacoes: string[];
  created_at: string | null;
  cached: boolean;
};

function normalizar(bruto: unknown): Leitura {
  const o = (bruto ?? {}) as Record<string, unknown>;
  const arr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
  return {
    leitura: typeof o["leitura"] === "string" && o["leitura"].trim() ? o["leitura"] : null,
    padroes: arr(o["padroes"]),
    recomendacoes: arr(o["recomendacoes"]),
    created_at: typeof o["created_at"] === "string" ? o["created_at"] : null,
    cached: o["cached"] === true,
  };
}

export function LeituraSemana({ dias = 90 }: { dias?: number }) {
  const { organizationId } = useOrg();
  const [force, setForce] = useState(false);

  const { data, isFetching, error, refetch } = useQuery<Leitura>({
    queryKey: ["radar-leitura", organizationId, dias],
    enabled: !!organizationId,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("radar_leitura", {
        body: { organization_id: organizationId, dias, ...(force ? { force: true } : {}) },
      });
      if (error) throw new Error(error.message);
      return normalizar(data);
    },
  });

  const atualizar = async () => {
    setForce(true);
    await refetch();
    setForce(false);
  };

  return (
    <section className="cartao border-l-2 border-l-azure p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-txt">
          <Sparkles size={15} className="text-azureClaro" aria-hidden />
          Leitura da semana
        </h2>
        <button
          type="button"
          onClick={atualizar}
          disabled={isFetching}
          className="btn flex items-center gap-1.5 px-2.5 py-1 text-xs disabled:opacity-50"
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} aria-hidden />
          Atualizar
        </button>
      </div>

      {isFetching && !data ? (
        <div className="space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded bg-white/6" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/6" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/6" />
        </div>
      ) : error || !data?.leitura ? (
        <p className="text-sm text-muted">
          Leitura por IA indisponível agora — os rankings abaixo seguem completos.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="prosa text-sm">
            <p>{data.leitura}</p>
          </div>

          {data.padroes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.padroes.map((p) => (
                <span key={p} className="pill bg-azure/12 text-azureClaro">
                  {p}
                </span>
              ))}
            </div>
          ) : null}

          {data.recomendacoes.length > 0 ? (
            <ul className="space-y-1.5">
              {data.recomendacoes.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-corpo">
                  <Check size={14} className="mt-[3px] shrink-0 text-bom" aria-hidden />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}

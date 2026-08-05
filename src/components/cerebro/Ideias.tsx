import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { CartaoIdeia, type GrupoIdeia } from "@/components/cerebro/CartaoIdeia";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useGerarIdeias, useIdeias, type Ideia } from "@/hooks/useIdeias";

const SECOES: { grupo: GrupoIdeia; rotulo: string }[] = [
  { grupo: "nova", rotulo: "Novas" },
  { grupo: "variacao", rotulo: "Variações" },
  { grupo: "adaptacao", rotulo: "Adaptações" },
];

function normalizar(tipo: string | null): GrupoIdeia {
  const t = (tipo ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (t.startsWith("varia")) return "variacao";
  if (t.startsWith("adapta")) return "adaptacao";
  return "nova";
}

export function Ideias() {
  const { ideias, carregando } = useIdeias();
  const gerar = useGerarIdeias();

  const grupos = useMemo(() => {
    const mapa: Record<GrupoIdeia, Ideia[]> = { nova: [], variacao: [], adaptacao: [] };
    for (const i of ideias) mapa[normalizar(i.tipo)].push(i);
    return mapa;
  }, [ideias]);

  return (
    <div className="space-y-4">
      <div className="cartao flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-bold text-txt">
            <Lightbulb size={15} className="text-azureClaro" /> Ideias
          </h2>
          <p className="text-xs text-muted">
            a IA lê tudo que funcionou e propõe novas, variações e adaptações
          </p>
        </div>
        <button
          type="button"
          className="btn-primario flex h-9 items-center gap-2 px-3 text-xs disabled:opacity-60"
          disabled={gerar.isPending}
          onClick={() =>
            gerar.mutate(undefined, {
              onSuccess: () => toast.success("Ideias geradas"),
              onError: (e) => toast.error(e instanceof Error ? e.message : "Não deu para gerar"),
            })
          }
        >
          {gerar.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {gerar.isPending ? "Gerando…" : "Gerar novas ideias"}
        </button>
      </div>

      {carregando ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="cartao space-y-2 p-4">
              <div className="h-4 w-3/4 esqueleto rounded" />
              <div className="h-3 w-full esqueleto rounded" />
              <div className="h-3 w-2/3 esqueleto rounded" />
              <div className="h-6 w-1/2 esqueleto rounded" />
            </div>
          ))}
        </div>
      ) : ideias.length === 0 ? (
        <div className="cartao p-4">
          <EstadoVazio
            titulo="Sem ideias ainda"
            descricao="Sem ideias ainda — clique em Gerar novas ideias."
          />
        </div>
      ) : (
        <div className="space-y-5">
          {SECOES.map((s) =>
            grupos[s.grupo].length === 0 ? null : (
              <section key={s.grupo} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="rotulo">{s.rotulo}</h3>
                  <span className="numero text-[.7rem] text-muted">{grupos[s.grupo].length}</span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {grupos[s.grupo].map((i) => (
                    <CartaoIdeia key={i.id} ideia={i} grupo={s.grupo} />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Revelar } from "@/components/Revelar";
import { CartaoPauta, haQuanto } from "@/components/pautas/CartaoPauta";
import { FiltrosPautas } from "@/components/pautas/FiltrosPautas";
import { usePautas } from "@/hooks/useInteligencia";

export function Pautas() {
  const navigate = useNavigate();
  const {
    lista,
    contagemStatus,
    contagemTipo,
    pilares,
    filtros,
    definir,
    limpar,
    temFiltroExtra,
    carregando,
    ultimaRodada,
    aceitar,
    descartar,
  } = usePautas();

  const ocupado = aceitar.isPending || descartar.isPending;

  return (
    <Revelar className="space-y-4">
      <div className="secao-entrada flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Pautas</h1>
          <p className="mt-1 max-w-2xl text-xs text-muted">
            O cérebro gera pautas novas toda segunda de manhã, e aprende com o resultado de cada
            pauta aceita.
          </p>
        </div>
        <span className="text-xs text-muted">última rodada de pautas {haQuanto(ultimaRodada)}</span>
      </div>

      <FiltrosPautas
        filtros={filtros}
        definir={definir}
        limpar={limpar}
        contagemStatus={contagemStatus}
        contagemTipo={contagemTipo}
        pilares={pilares}
        total={lista.length}
        temFiltroExtra={temFiltroExtra}
      />

      {carregando ? (
        <div className="secao-entrada space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cartao space-y-2 p-4">
              <div className="h-4 w-24 rounded bg-white/6" />
              <div className="h-4 w-2/3 rounded bg-white/6" />
              <div className="h-3 w-full rounded bg-white/6" />
            </div>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="secao-entrada cartao p-8 text-sm text-muted">
          {temFiltroExtra
            ? "Nenhuma pauta encontrada com esses filtros."
            : filtros.status === "new"
              ? "Nenhuma pauta aberta. A próxima rodada automática é segunda de manhã."
              : "Nada por aqui ainda."}
        </div>
      ) : (
        <div className="secao-entrada space-y-3">
          {lista.map((s) => (
            <CartaoPauta
              key={s.id}
              s={s}
              ocupado={ocupado}
              onAceitar={() =>
                aceitar.mutate(s.id, {
                  onSuccess: ({ id }) => {
                    toast.success("Pauta aceita — post criado.");
                    navigate({ to: "/post/$id", params: { id } });
                  },
                  onError: (e: Error) => toast.error(e.message),
                })
              }
              onDescartar={() =>
                descartar.mutate(s.id, {
                  onSuccess: () => toast.success("Pauta descartada."),
                  onError: (e: Error) => toast.error(e.message),
                })
              }
            />
          ))}
        </div>
      )}
    </Revelar>
  );
}

import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Revelar } from "@/components/Revelar";
import { CartaoPauta, haQuanto } from "@/components/pautas/CartaoPauta";
import { usePautas, type FiltroPauta } from "@/hooks/useInteligencia";

const FILTROS: { valor: FiltroPauta; rotulo: string }[] = [
  { valor: "new", rotulo: "Novas" },
  { valor: "accepted", rotulo: "Aceitas" },
  { valor: "dismissed", rotulo: "Descartadas" },
];

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
        (ativo
          ? "border-azure/40 bg-azure/14 font-semibold text-txt"
          : "border-line text-muted hover:text-corpo")
      }
    >
      {children}
    </button>
  );
}

export function Pautas() {
  const navigate = useNavigate();
  const { lista, contagem, filtro, setFiltro, carregando, ultimaRodada, aceitar, descartar } =
    usePautas();

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

      <div className="secao-entrada flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <Chip key={f.valor} ativo={filtro === f.valor} onClick={() => setFiltro(f.valor)}>
            {f.rotulo} ({contagem[f.valor]})
          </Chip>
        ))}
      </div>

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
          {filtro === "new"
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

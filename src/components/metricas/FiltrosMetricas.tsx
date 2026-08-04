import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { textoFrescor } from "@/lib/metricas";
import type { Periodo } from "@/hooks/useMetricas";
import type { Pilar } from "@/lib/conteudo";

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

export function FiltrosMetricas({
  dias,
  setDias,
  conta,
  setConta,
  pilar,
  setPilar,
  contas,
  pilares,
  ultimaColeta,
  atualizando,
  atualizar,
  comparacao,
  setComparacao,
  customDesde,
  setCustomDesde,
  customAte,
  setCustomAte,
}: {
  dias: Periodo;
  setDias: (v: Periodo) => void;
  conta: string;
  setConta: (v: string) => void;
  pilar: string;
  setPilar: (v: string) => void;
  contas: { id: string; handle: string }[];
  pilares: Pilar[];
  ultimaColeta: number | null;
  atualizando: boolean;
  atualizar: () => void;
  comparacao: ModoComparacao;
  setComparacao: (v: ModoComparacao) => void;
  customDesde: string;
  setCustomDesde: (v: string) => void;
  customAte: string;
  setCustomAte: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rotulo mr-1">Período</span>
          {([7, 30, 90] as Periodo[]).map((d) => (
            <Chip key={d} ativo={dias === d} onClick={() => setDias(d)}>
              {d} dias
            </Chip>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rotulo mr-1">Conta</span>
          <Chip ativo={conta === "todas"} onClick={() => setConta("todas")}>
            Todas
          </Chip>
          {contas.map((c) => (
            <Chip key={c.id} ativo={conta === c.handle} onClick={() => setConta(c.handle)}>
              @{c.handle}
            </Chip>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rotulo mr-1">Pilar</span>
          <Chip ativo={pilar === "todos"} onClick={() => setPilar("todos")}>
            Todos
          </Chip>
          {pilares.map((p) => (
            <Chip key={p.id} ativo={pilar === p.id} onClick={() => setPilar(p.id)}>
              {p.name}
            </Chip>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rotulo mr-1">Comparar</span>
          <Chip ativo={comparacao === "off"} onClick={() => setComparacao("off")}>
            Desligado
          </Chip>
          <Chip ativo={comparacao === "anterior"} onClick={() => setComparacao("anterior")}>
            Período anterior
          </Chip>
          <Chip ativo={comparacao === "custom"} onClick={() => setComparacao("custom")}>
            Personalizado
          </Chip>
        </div>
      </div>


      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-muted">{textoFrescor(ultimaColeta)}</span>
        <button type="button" className="btn flex h-[30px] items-center gap-1.5 px-2.5 text-xs" onClick={atualizar}>
          <IconeAtualizar girando={atualizando} />
          Atualizar
        </button>
      </div>
    </div>
  );
}

function IconeAtualizar({ girando }: { girando: boolean }) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (girando) setAtivo(true);
  }, [girando]);

  return (
    <RefreshCw
      size={13}
      className={ativo ? "animate-spin motion-reduce:animate-none" : ""}
      onAnimationIteration={() => {
        if (!girando) setAtivo(false);
      }}
    />
  );
}

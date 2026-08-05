import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  GatilhoFiltro,
  ItemOpcao,
  MenuFiltro,
  PainelFiltro,
  type OpcaoFiltro,
} from "@/components/filtros/MenuFiltro";
import { textoFrescor } from "@/lib/metricas";
import type { ModoComparacao, Periodo } from "@/hooks/useMetricas";
import type { Pilar } from "@/lib/conteudo";

const ROTULO_COMPARACAO: Record<ModoComparacao, string> = {
  off: "Desligado",
  anterior: "Período anterior",
  custom: "Personalizado",
};

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
  const [abreConta, setAbreConta] = useState(false);
  const [abreComparar, setAbreComparar] = useState(false);
  const [busca, setBusca] = useState("");

  const contasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return contas;
    return contas.filter((c) => c.handle.toLowerCase().includes(termo));
  }, [contas, busca]);

  const opcoesPeriodo: OpcaoFiltro<string>[] = [7, 14, 30, 90].map((d) => ({
    valor: String(d),
    rotulo: `${d} dias`,
  }));

  const opcoesPilar: OpcaoFiltro<string>[] = [
    { valor: "todos", rotulo: "Todos os pilares" },
    ...pilares.map((p) => ({ valor: p.id, rotulo: p.name, cor: p.color })),
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <MenuFiltro
          rotulo="Período"
          valor={String(dias)}
          padrao="30"
          largura="w-44"
          opcoes={opcoesPeriodo}
          onEscolher={(v) => setDias(Number(v) as Periodo)}
        />

        <Popover open={abreConta} onOpenChange={setAbreConta}>
          <PopoverTrigger asChild>
            <GatilhoFiltro
              rotulo="Conta"
              valor={conta === "todas" ? "Todas" : `@${conta.replace(/^@/, "")}`}
              destacado={conta !== "todas"}
              aberto={abreConta}
            />
          </PopoverTrigger>
          <PainelFiltro largura="w-64">
            {contas.length > 6 ? (
              <div className="mb-1 flex items-center gap-2 rounded-[.45rem] border border-line bg-bg2 px-2.5 py-1.5">
                <Search size={13} className="shrink-0 text-muted" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar conta"
                  className="w-full bg-transparent text-xs text-txt outline-none placeholder:text-muted"
                />
              </div>
            ) : null}

            <ItemOpcao
              ativo={conta === "todas"}
              onClick={() => {
                setConta("todas");
                setAbreConta(false);
              }}
            >
              Todas as contas
            </ItemOpcao>

            <div className="my-1 h-px bg-line" />

            <div className="max-h-64 overflow-y-auto">
              {contasFiltradas.length === 0 ? (
                <p className="px-2.5 py-3 text-xs text-muted">Nenhuma conta encontrada.</p>
              ) : (
                contasFiltradas.map((c) => (
                  <ItemOpcao
                    key={c.id}
                    ativo={conta === c.handle}
                    onClick={() => {
                      setConta(c.handle);
                      setAbreConta(false);
                    }}
                  >
                    @{c.handle.replace(/^@/, "")}
                  </ItemOpcao>
                ))
              )}
            </div>
          </PainelFiltro>
        </Popover>

        <MenuFiltro
          rotulo="Pilar"
          valor={pilar}
          padrao="todos"
          largura="w-60"
          opcoes={opcoesPilar}
          onEscolher={setPilar}
        />

        <Popover open={abreComparar} onOpenChange={setAbreComparar}>
          <PopoverTrigger asChild>
            <GatilhoFiltro
              rotulo="Comparar"
              valor={ROTULO_COMPARACAO[comparacao]}
              destacado={comparacao !== "off"}
              aberto={abreComparar}
            />
          </PopoverTrigger>
          <PainelFiltro largura="w-64">
            {(["off", "anterior", "custom"] as ModoComparacao[]).map((m) => (
              <ItemOpcao
                key={m}
                ativo={comparacao === m}
                onClick={() => {
                  setComparacao(m);
                  if (m !== "custom") setAbreComparar(false);
                }}
              >
                {ROTULO_COMPARACAO[m]}
              </ItemOpcao>
            ))}

            {comparacao === "custom" ? (
              <div className="mt-1 border-t border-line px-1 pt-2">
                <span className="rotulo">Comparar com</span>
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    type="date"
                    value={customDesde}
                    onChange={(e) => setCustomDesde(e.target.value)}
                    className="h-[30px] rounded-[.45rem] border border-line bg-bg2 px-2 text-xs text-corpo outline-none focus:border-azure"
                    aria-label="Início do período comparado"
                  />
                  <input
                    type="date"
                    value={customAte}
                    onChange={(e) => setCustomAte(e.target.value)}
                    className="h-[30px] rounded-[.45rem] border border-line bg-bg2 px-2 text-xs text-corpo outline-none focus:border-azure"
                    aria-label="Fim do período comparado"
                  />
                </div>
              </div>
            ) : null}
          </PainelFiltro>
        </Popover>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-muted">{textoFrescor(ultimaColeta)}</span>
        <button
          type="button"
          className="btn flex h-[30px] items-center gap-1.5 px-2.5 text-xs"
          onClick={atualizar}
        >
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

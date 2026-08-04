import { forwardRef, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, RefreshCw, Search } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { textoFrescor } from "@/lib/metricas";
import type { ModoComparacao, Periodo } from "@/hooks/useMetricas";
import type { Pilar } from "@/lib/conteudo";

type PropsGatilho = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  rotulo: string;
  valor: string;
  destacado: boolean;
  aberto: boolean;
};

const GatilhoFiltro = forwardRef<HTMLButtonElement, PropsGatilho>(function GatilhoFiltro(
  { rotulo, valor, destacado, aberto, className, ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...resto}
      className={
        "flex min-w-[8.5rem] flex-1 items-center gap-2 rounded-[.6rem] border px-3 py-1.5 text-left transition-colors sm:flex-none " +
        (destacado
          ? "border-azure/40 bg-azure/14 "
          : "border-line bg-card hover:border-lineForte ") +
        (aberto ? "border-azure/50 " : "") +
        (className ?? "")
      }
    >
      <span className="min-w-0 flex-1">
        <span className="rotulo block leading-none">{rotulo}</span>
        <span
          className={
            "mt-1 block truncate text-xs font-medium leading-none " +
            (destacado ? "text-txt" : "text-corpo")
          }
        >
          {valor}
        </span>
      </span>
      <ChevronDown
        size={14}
        className={
          "shrink-0 text-muted transition-transform duration-200 " + (aberto ? "rotate-180" : "")
        }
      />
    </button>
  );
});


function ItemOpcao({
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
        "flex w-full items-center gap-2 rounded-[.45rem] px-2.5 py-2 text-left text-xs transition-colors " +
        (ativo ? "bg-azure/14 font-semibold text-white" : "text-corpo hover:bg-white/[.06]")
      }
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {ativo ? <Check size={13} className="shrink-0 text-azureClaro" /> : null}
    </button>
  );
}

function Painel({ children, largura = "w-56" }: { children: React.ReactNode; largura?: string }) {
  return (
    <PopoverContent
      align="start"
      sideOffset={6}
      className={
        largura +
        " rounded-[.7rem] border-line bg-card p-1.5 shadow-[0_10px_34px_-18px_rgb(0_0_0/.6)]"
      }
    >
      {children}
    </PopoverContent>
  );
}

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
  const [abrePeriodo, setAbrePeriodo] = useState(false);
  const [abreConta, setAbreConta] = useState(false);
  const [abrePilar, setAbrePilar] = useState(false);
  const [abreComparar, setAbreComparar] = useState(false);
  const [busca, setBusca] = useState("");

  const contasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return contas;
    return contas.filter((c) => c.handle.toLowerCase().includes(termo));
  }, [contas, busca]);

  const pilarAtivo = pilares.find((p) => p.id === pilar);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {/* Período */}
        <Popover open={abrePeriodo} onOpenChange={setAbrePeriodo}>
          <PopoverTrigger asChild>
            <span className="contents">
              <GatilhoFiltro
                rotulo="Período"
                valor={`${dias} dias`}
                destacado={dias !== 30}
                aberto={abrePeriodo}
              />
            </span>
          </PopoverTrigger>
          <Painel largura="w-44">
            {([7, 30, 90] as Periodo[]).map((d) => (
              <ItemOpcao
                key={d}
                ativo={dias === d}
                onClick={() => {
                  setDias(d);
                  setAbrePeriodo(false);
                }}
              >
                {d} dias
              </ItemOpcao>
            ))}
          </Painel>
        </Popover>

        {/* Conta */}
        <Popover open={abreConta} onOpenChange={setAbreConta}>
          <PopoverTrigger asChild>
            <span className="contents">
              <GatilhoFiltro
                rotulo="Conta"
                valor={conta === "todas" ? "Todas" : `@${conta}`}
                destacado={conta !== "todas"}
                aberto={abreConta}
              />
            </span>
          </PopoverTrigger>
          <Painel largura="w-64">
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
          </Painel>
        </Popover>

        {/* Pilar */}
        <Popover open={abrePilar} onOpenChange={setAbrePilar}>
          <PopoverTrigger asChild>
            <span className="contents">
              <GatilhoFiltro
                rotulo="Pilar"
                valor={pilarAtivo ? pilarAtivo.name : "Todos"}
                destacado={pilar !== "todos"}
                aberto={abrePilar}
              />
            </span>
          </PopoverTrigger>
          <Painel largura="w-60">
            <ItemOpcao
              ativo={pilar === "todos"}
              onClick={() => {
                setPilar("todos");
                setAbrePilar(false);
              }}
            >
              Todos os pilares
            </ItemOpcao>

            <div className="my-1 h-px bg-line" />

            <div className="max-h-64 overflow-y-auto">
              {pilares.length === 0 ? (
                <p className="px-2.5 py-3 text-xs text-muted">Nenhum pilar cadastrado.</p>
              ) : (
                pilares.map((p) => (
                  <ItemOpcao
                    key={p.id}
                    ativo={pilar === p.id}
                    onClick={() => {
                      setPilar(p.id);
                      setAbrePilar(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: p.color ?? "#8294ab" }}
                      />
                      <span className="truncate">{p.name}</span>
                    </span>
                  </ItemOpcao>
                ))
              )}
            </div>
          </Painel>
        </Popover>

        {/* Comparar */}
        <Popover open={abreComparar} onOpenChange={setAbreComparar}>
          <PopoverTrigger asChild>
            <span className="contents">
              <GatilhoFiltro
                rotulo="Comparar"
                valor={ROTULO_COMPARACAO[comparacao]}
                destacado={comparacao !== "off"}
                aberto={abreComparar}
              />
            </span>
          </PopoverTrigger>
          <Painel largura="w-64">
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
          </Painel>
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

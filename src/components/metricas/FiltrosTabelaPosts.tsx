import { ArrowDownWideNarrow, ArrowUpNarrowWide, Columns3, Search, X } from "lucide-react";

import {
  ItemOpcao,
  MenuFiltro,
  PainelFiltro,
  type OpcaoFiltro,
} from "@/components/filtros/MenuFiltro";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import type { Formato } from "@/lib/conteudo";
import { rotuloFormato } from "@/lib/metricas";
import {
  FAIXAS_RX,
  METRICAS_TABELA,
  type ChaveMetrica,
  type FaixaRx,
} from "@/lib/metricas";

export type EstadoFiltros = {
  busca: string;
  formato: "todos" | Formato;
  faixa: FaixaRx;
  minimo: string;
  quantidade: number;
  ranquear: ChaveMetrica;
  desc: boolean;
};

export function FiltrosTabelaPosts({
  estado,
  setEstado,
  formatos,
  colunas,
  alternarColuna,
  total,
  visiveis,
  aoLimpar,
  temFiltro,
}: {
  estado: EstadoFiltros;
  setEstado: (p: Partial<EstadoFiltros>) => void;
  formatos: { valor: Formato; contagem: number }[];
  colunas: ChaveMetrica[];
  alternarColuna: (c: ChaveMetrica) => void;
  total: number;
  visiveis: number;
  aoLimpar: () => void;
  temFiltro: boolean;
}) {
  const [colAberto, setColAberto] = useState(false);

  const opcoesMetrica: OpcaoFiltro<ChaveMetrica>[] = METRICAS_TABELA.map((m) => ({
    valor: m.chave,
    rotulo: m.indisponivel ? `${m.rotulo} (não coletado)` : m.rotulo,
  }));

  const opcoesFormato: OpcaoFiltro<"todos" | Formato>[] = [
    { valor: "todos", rotulo: "Todos os formatos", contagem: total },
    ...formatos.map((f) => ({
      valor: f.valor,
      rotulo: rotuloFormato(f.valor),
      contagem: f.contagem,
    })),
  ];

  const rotuloMetrica = METRICAS_TABELA.find((m) => m.chave === estado.ranquear)?.rotulo ?? "—";

  return (
    <div className="mb-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-[38px] min-w-[12rem] flex-1 items-center gap-1.5 rounded-[.6rem] border border-line bg-card px-2.5 sm:max-w-xs">
          <Search size={13} className="shrink-0 text-muted" aria-hidden />
          <input
            value={estado.busca}
            onChange={(e) => setEstado({ busca: e.target.value })}
            placeholder="buscar por título ou conta"
            className="min-w-0 flex-1 bg-transparent text-xs text-txt outline-none placeholder:text-muted"
          />
          {estado.busca ? (
            <button
              type="button"
              onClick={() => setEstado({ busca: "" })}
              className="shrink-0 text-muted transition-colors hover:text-txt"
              aria-label="limpar busca"
            >
              <X size={13} />
            </button>
          ) : null}
        </label>

        <MenuFiltro
          rotulo="Ranquear por"
          valor={estado.ranquear}
          opcoes={opcoesMetrica}
          padrao={"rx" as ChaveMetrica}
          onEscolher={(v) => setEstado({ ranquear: v })}
          largura="w-60"
        />

        <button
          type="button"
          onClick={() => setEstado({ desc: !estado.desc })}
          className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-[.6rem] border border-line bg-card px-3 text-xs text-corpo transition-colors hover:border-lineForte hover:text-txt"
          title={estado.desc ? "Maior para menor" : "Menor para maior"}
        >
          {estado.desc ? (
            <ArrowDownWideNarrow size={14} className="text-azureClaro" />
          ) : (
            <ArrowUpNarrowWide size={14} className="text-azureClaro" />
          )}
          {estado.desc ? "maior → menor" : "menor → maior"}
        </button>

        <Popover open={colAberto} onOpenChange={setColAberto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-[.6rem] border border-line bg-card px-3 text-xs text-corpo transition-colors hover:border-lineForte hover:text-txt"
            >
              <Columns3 size={14} className="text-muted" />
              Colunas
              <span className="numero text-[.68rem] text-muted">{colunas.length}</span>
            </button>
          </PopoverTrigger>
          <PainelFiltro largura="w-56">
            <div className="max-h-72 overflow-y-auto">
              {METRICAS_TABELA.map((m) => (
                <ItemOpcao
                  key={m.chave}
                  ativo={colunas.includes(m.chave)}
                  onClick={() => alternarColuna(m.chave)}
                >
                  {m.indisponivel ? `${m.rotulo} · não coletado` : m.rotulo}
                </ItemOpcao>
              ))}
            </div>
          </PainelFiltro>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MenuFiltro
          rotulo="Formato"
          valor={estado.formato}
          opcoes={opcoesFormato}
          padrao="todos"
          onEscolher={(v) => setEstado({ formato: v })}
        />
        <MenuFiltro
          rotulo="Faixa de rx"
          valor={estado.faixa}
          opcoes={FAIXAS_RX.map((f) => ({ valor: f.valor, rotulo: f.rotulo }))}
          padrao="todas"
          onEscolher={(v) => setEstado({ faixa: v })}
          largura="w-60"
        />

        <label className="flex h-[38px] items-center gap-2 rounded-[.6rem] border border-line bg-card px-3">
          <span className="rotulo whitespace-nowrap">{rotuloMetrica} acima de</span>
          <input
            inputMode="numeric"
            value={estado.minimo}
            onChange={(e) => setEstado({ minimo: e.target.value.replace(/[^\d.,]/g, "") })}
            placeholder="0"
            className="numero w-16 bg-transparent text-xs text-txt outline-none placeholder:text-muted"
          />
        </label>

        <MenuFiltro
          rotulo="Mostrar"
          valor={String(estado.quantidade)}
          opcoes={[
            { valor: "10", rotulo: "10 posts" },
            { valor: "20", rotulo: "20 posts" },
            { valor: "50", rotulo: "50 posts" },
            { valor: "9999", rotulo: "Todos" },
          ]}
          padrao="20"
          onEscolher={(v) => setEstado({ quantidade: Number(v) })}
          largura="w-44"
        />

        <span className="numero ml-auto text-xs text-muted">
          {visiveis} de {total} posts
        </span>
        {temFiltro ? (
          <button
            type="button"
            onClick={aoLimpar}
            className="rounded-[.45rem] px-2 py-1 text-[.7rem] text-muted transition-colors hover:text-txt"
          >
            limpar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}

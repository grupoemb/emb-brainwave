import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Dica } from "@/components/painel/Dica";
import { Sparkline } from "@/components/metricas/Sparkline";
import { compacto, numero } from "@/lib/metricas";
import type { Heroi } from "@/lib/painel.leitura";

function variacao(atual: number | null, anterior: number | null) {
  if (atual === null || anterior === null || anterior === 0) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function MiniBarras({ atual, anterior, cor }: { atual: number; anterior: number; cor: string }) {
  const max = Math.max(atual, anterior, 1);
  const linha = (v: number, rotulo: string, forte: boolean) => (
    <div className="flex items-center gap-2">
      <span className="rotulo w-10 shrink-0 text-[.54rem]">{rotulo}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${Math.max(2, (v / max) * 100)}%`,
            backgroundColor: forte ? cor : "rgba(148,163,184,.45)",
          }}
        />
      </span>
    </div>
  );
  return (
    <div className="mt-3 space-y-1.5">
      {linha(atual, "agora", true)}
      {linha(anterior, "antes", false)}
    </div>
  );
}

export function CartaoHeroi({ heroi }: { heroi: Heroi }) {
  const v = variacao(heroi.valor, heroi.anterior);
  const neutro = v === null || Math.abs(v) < 0.5;
  const bom = (v ?? 0) > 0;
  const Icone = neutro ? Minus : bom ? ArrowUpRight : ArrowDownRight;
  const temSerie = !!heroi.serie && heroi.serie.length > 1;

  return (
    <div className="cartao relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden p-4 transition-colors hover:bg-white/4">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl"
        style={{ background: `${heroi.cor}26` }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${heroi.cor}, transparent)` }}
      />

      <span className="rotulo flex items-center gap-1">
        {heroi.rotulo}
        <Dica texto={heroi.dica} />
      </span>

      <div className="mt-1 flex items-end gap-2.5">
        <span
          className={"numero text-4xl leading-none " + (heroi.valor === null ? "text-muted" : "")}
          title={heroi.compactar && heroi.valor !== null ? numero(heroi.valor) : undefined}
        >
          {heroi.valor === null
            ? "—"
            : heroi.compactar
              ? compacto(heroi.valor)
              : numero(heroi.valor, heroi.casas ?? 0)}
          {heroi.valor !== null && heroi.sufixo ? (
            <span className="text-base text-muted">{heroi.sufixo}</span>
          ) : null}
        </span>
        {v !== null ? (
          <span
            className={
              "numero mb-1 inline-flex items-center gap-0.5 text-xs " +
              (neutro ? "text-muted" : bom ? "text-bom" : "text-ruim")
            }
            title="Variação vs. o período anterior de mesmo tamanho"
          >
            <Icone size={13} />
            {numero(Math.abs(v), 1)}%
          </span>
        ) : (
          <span className="mb-1 text-xs text-muted">sem base anterior</span>
        )}
      </div>

      {temSerie ? (
        <div className="pointer-events-none -mx-4 -mb-4 mt-3 opacity-90">
          <Sparkline dados={heroi.serie!} cor={heroi.cor} altura={46} />
        </div>
      ) : heroi.valor !== null && heroi.anterior !== null ? (
        <MiniBarras atual={heroi.valor} anterior={heroi.anterior} cor={heroi.cor} />
      ) : (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
          <span
            className="block h-full w-1/3 rounded-full"
            style={{ backgroundColor: `${heroi.cor}80` }}
          />
        </div>
      )}
    </div>
  );
}

export function LinhaHerois({ herois }: { herois: Heroi[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {herois.map((h) => (
        <CartaoHeroi key={h.chave} heroi={h} />
      ))}
    </div>
  );
}

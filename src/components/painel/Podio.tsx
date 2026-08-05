import { Link } from "@tanstack/react-router";
import { Flame, Medal, TrendingDown, TrendingUp } from "lucide-react";

import { AvatarConta } from "@/components/painel/AvatarConta";
import { Dica } from "@/components/painel/Dica";
import { Sparkline } from "@/components/metricas/Sparkline";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { TooltipProvider } from "@/components/ui/tooltip";
import { corDoCanal, type Canal } from "@/lib/conteudo";
import { GLOSSARIO } from "@/lib/glossario";
import { compacto, numero } from "@/lib/metricas";
import type { ContaPainel } from "@/lib/painel.tipos";

const BRONZE = { cor: "#cd8b57", fundo: "rgba(205,139,87,.14)", rotulo: "3º lugar" };

const MEDALHAS = [
  { cor: "#f2c14e", fundo: "rgba(242,193,78,.14)", rotulo: "1º lugar" },
  { cor: "#c9d4e2", fundo: "rgba(201,212,226,.12)", rotulo: "2º lugar" },
  BRONZE,
];

function classeRxPill(rx: number | null) {
  if (rx === null) return "pill text-muted";
  if (rx >= 1.3) return "pill pill-bom";
  if (rx >= 0.8) return "pill pill-alerta";
  return "pill pill-ruim";
}

function Metrica({
  rotulo,
  valor,
  dica,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  dica?: string;
  destaque?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="rotulo flex items-center gap-1 text-[.62rem]">
        {rotulo}
        {dica ? <Dica texto={dica} /> : null}
      </span>
      <span className={"numero block truncate " + (destaque ? "text-lg" : "text-sm text-corpo")}>
        {valor}
      </span>
    </div>
  );
}

function CartaoConta({
  conta,
  posicao,
  totalAlcance,
  dias,
}: {
  conta: ContaPainel;
  posicao: number;
  totalAlcance: number;
  dias: number;
}) {
  const medalha = MEDALHAS[posicao] ?? BRONZE;
  const share = totalAlcance > 0 ? ((conta.alcance ?? 0) / totalAlcance) * 100 : 0;
  const v = conta.variacaoAlcance;
  const lider = posicao === 0;

  return (
    <div
      className={
        "cartao relative flex flex-col gap-3 overflow-hidden p-4 " +
        (lider ? "ring-1 ring-inset" : "")
      }
      style={lider ? { boxShadow: `inset 0 0 0 1px ${medalha.fundo}` } : undefined}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{ background: medalha.fundo }}
      />

      <div className="flex items-center gap-3">
        <div className="relative">
          <AvatarConta conta={conta.conta} url={conta.avatarUrl} tamanho={46} />
          <span
            className="numero absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full text-[.6rem] font-bold"
            style={{ background: medalha.cor, color: "#0a1020" }}
            title={medalha.rotulo}
          >
            {posicao + 1}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: corDoCanal((conta.channel ?? null) as Canal | null) }}
            />
            <span className="truncate text-sm font-bold text-txt">@{conta.conta}</span>
          </div>
          <span className="text-xs text-muted">
            {conta.posts} {conta.posts === 1 ? "post" : "posts"} em {dias} dias
          </span>
        </div>
        <Medal size={18} style={{ color: medalha.cor }} className="shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        <Metrica
          rotulo="Alcance"
          valor={conta.alcance === null ? "—" : compacto(conta.alcance)}
          dica={GLOSSARIO.alcancePeriodo}
          destaque
        />
        <Metrica
          rotulo="Média/post"
          valor={conta.alcanceMedio === null ? "—" : compacto(conta.alcanceMedio)}
          dica={GLOSSARIO.alcanceMedio}
          destaque
        />
        <Metrica
          rotulo="Engajamento"
          valor={conta.engajamento === null ? "—" : `${numero(conta.engajamento, 2)}%`}
          dica={GLOSSARIO.engajamento}
        />
        <Metrica
          rotulo="Consistência"
          valor={conta.consistencia === null ? "—" : `${conta.consistencia}%`}
          dica={GLOSSARIO.consistencia}
        />
        <Metrica rotulo="Salvos" valor={compacto(conta.saves)} />
        <Metrica rotulo="Compart." valor={compacto(conta.shares)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={classeRxPill(conta.rxMedio) + " numero"} title={GLOSSARIO.rxMedio}>
          {conta.rxMedio === null ? "—" : `${numero(conta.rxMedio, 2)}× rx`}
        </span>
        {conta.outliers > 0 ? (
          <span
            className="pill pill-alerta numero inline-flex items-center gap-1"
            title={GLOSSARIO.foraDaCurva}
          >
            <Flame size={11} />
            {conta.outliers}
          </span>
        ) : null}
        {v !== null ? (
          <span
            className={
              "numero inline-flex items-center gap-0.5 text-xs " +
              (v >= 0 ? "text-bom" : "text-ruim")
            }
            title="Variação do alcance vs. o período anterior"
          >
            {v >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {numero(Math.abs(v), 1)}%
          </span>
        ) : null}
      </div>

      <div className="-mx-4 opacity-80">
        <Sparkline dados={conta.serie} cor={medalha.cor} altura={34} />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[.68rem] text-muted">
          <span>participação no alcance</span>
          <span className="numero">{numero(share, 1)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, share)}%`, background: medalha.cor }}
          />
        </div>
      </div>

      {conta.melhorPost ? (
        <Link
          to="/post/$id"
          params={{ id: conta.melhorPost.id }}
          search={{ origem: "painel", dias }}
          className="flex items-center gap-2 rounded-[.5rem] border border-line px-2 py-1.5 hover:bg-white/6"
          title={GLOSSARIO.melhorPost}
        >
          <span className="rotulo shrink-0 text-[.6rem]">top</span>
          <span className="flex-1 truncate text-xs text-corpo">{conta.melhorPost.title}</span>
          <span className="numero shrink-0 text-xs text-muted">
            {compacto(conta.melhorPost.alcance)}
          </span>
          <span className={classeRxPill(conta.melhorPost.rx) + " numero shrink-0"}>
            {conta.melhorPost.rx === null ? "—" : `${numero(conta.melhorPost.rx, 2)}×`}
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function Podio({ contas, dias }: { contas: ContaPainel[]; dias: number }) {
  const visiveis = contas.slice(0, 3);
  const total = contas.reduce((t, c) => t + (c.alcance ?? 0), 0);

  if (visiveis.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhuma conta com post publicado nesta janela"
        descricao="Experimente ampliar o período para 30 ou 90 dias."
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-3 lg:grid-cols-3">
        {visiveis.map((c, i) => (
          <CartaoConta key={c.conta} conta={c} posicao={i} totalAlcance={total} dias={dias} />
        ))}
      </div>
      {contas.length > 3 ? (
        <div className="cartao mt-3 divide-y divide-line p-1">
          {contas.slice(3).map((c, i) => (
            <div key={c.conta} className="flex items-center gap-3 px-3 py-2">
              <span className="numero w-5 shrink-0 text-xs text-muted">{i + 4}</span>
              <AvatarConta conta={c.conta} url={c.avatarUrl} tamanho={26} />
              <span className="flex-1 truncate text-sm text-corpo">@{c.conta}</span>
              <span className="numero shrink-0 text-xs text-muted">{c.posts} posts</span>
              <span className="numero shrink-0 text-sm">{compacto(c.alcance)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </TooltipProvider>
  );
}

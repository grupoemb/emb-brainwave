import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { Revelar } from "@/components/Revelar";
import { usePainel } from "@/hooks/usePainel";
import { COLUNAS, comAlfa, corDoCanal, type Canal } from "@/lib/conteudo";
import { numero, textoFrescor } from "@/lib/metricas";

const TZ = "America/Sao_Paulo";

function saudacao(d: Date) {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: TZ }).format(d),
  );
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataPorExtenso(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

function diaHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

function Dot({ cor, title }: { cor: string; title?: string }) {
  return (
    <span
      title={title}
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: cor }}
    />
  );
}

function Cartao({
  titulo,
  rodape,
  children,
}: {
  titulo: string;
  rodape?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="cartao flex flex-col p-4">
      <h2 className="rotulo mb-3">{titulo}</h2>
      <div className="flex-1 space-y-2">{children}</div>
      {rodape ? <div className="mt-3 border-t border-line pt-2 text-xs">{rodape}</div> : null}
    </div>
  );
}

function MiniKpi({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div className="cartao flex min-h-[5.9rem] flex-col justify-between p-4 transition-colors hover:bg-white/4">
      <span className="rotulo">{rotulo}</span>
      <span className={"numero text-2xl " + (valor === null ? "text-muted" : "")}>
        {valor === null ? "—" : numero(valor)}
      </span>
    </div>
  );
}


function BlocoVazio({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted">{children}</p>;
}

export function Painel() {
  const { dados, carregando } = usePainel();
  const agora = new Date();
  const primeiroNome = (dados?.nome ?? "").trim().split(/\s+/)[0] ?? "";
  const coleta = dados?.ultimaColeta ? new Date(dados.ultimaColeta).getTime() : null;

  if (carregando || !dados) {
    return (
      <Revelar className="space-y-4">
        <div className="secao-entrada h-12 w-72 rounded bg-white/6" />
        <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cartao min-h-[5.9rem] p-4">
              <div className="h-3 w-20 rounded bg-white/6" />
              <div className="mt-6 h-6 w-16 rounded bg-white/6" />
            </div>
          ))}
        </div>
        <div className="secao-entrada grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cartao h-52 p-4">
              <div className="h-3 w-28 rounded bg-white/6" />
            </div>
          ))}
        </div>
      </Revelar>
    );
  }

  return (
    <Revelar className="space-y-4">
      <div className="secao-entrada flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">
            {saudacao(agora)}
            {primeiroNome ? `, ${primeiroNome}` : ""}
          </h1>
          <p className="mt-1 text-xs capitalize text-muted">{dataPorExtenso(agora)}</p>
        </div>
        <span className="text-xs text-muted">{textoFrescor(coleta)}</span>
      </div>

      <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Link to="/calendario" title="Ver no calendário">
          <MiniKpi rotulo="Agendados" valor={dados.kpis.agendados} />
        </Link>
        <Link to="/kanban" title="Ver na coluna de aprovação">
          <MiniKpi rotulo="Aguardando aprovação" valor={dados.kpis.aguardandoAprovacao} />
        </Link>
        <Link
          to="/pautas"
          search={{ q: "", status: "new", tipo: "todos", pilar: "todos" }}
          title="Ver pautas novas"
        >
          <MiniKpi rotulo="Pautas novas" valor={dados.kpis.pautasNovas} />
        </Link>
        <Link to="/metricas" title="Ver métricas">
          <MiniKpi rotulo="Alcance 7d" valor={dados.kpis.alcance7d} />
        </Link>
        <Link to="/ajustes" title="Gerenciar contas conectadas">
          <MiniKpi rotulo="Contas conectadas" valor={dados.kpis.contasConectadas} />
        </Link>
      </div>


      <div className="secao-entrada grid gap-3 lg:grid-cols-3">
        <Cartao titulo="Próximos agendamentos">
          {dados.agendados.length === 0 ? (
            <div className="space-y-3">
              <BlocoVazio>Nada agendado pros próximos 7 dias.</BlocoVazio>
              <Link to="/calendario" className="btn inline-block px-3 py-1.5 text-xs">
                Abrir calendário
              </Link>
            </div>
          ) : (
            dados.agendados.map((p) => (
              <Link
                key={p.id}
                to="/post/$id"
                params={{ id: p.id }}
                className="flex items-center gap-2 rounded-[.5rem] px-2 py-1.5 hover:bg-white/6"
              >
                <Dot cor={corDoCanal((p.channel ?? null) as Canal | null)} />
                <span className="flex-1 truncate text-sm text-corpo">{p.title}</span>
                {!p.aprovado ? <Dot cor="#f6bd24" title="sem aprovação" /> : null}
                <span className="numero shrink-0 text-xs text-muted">
                  {diaHora(p.scheduled_for)}
                </span>
              </Link>
            ))
          )}
        </Cartao>

        <Cartao
          titulo="Pautas em destaque"
          rodape={
            <Link to="/pautas" className="text-azureClaro hover:underline">
              ver todas
            </Link>
          }
        >
          {dados.pautas.length === 0 ? (
            <BlocoVazio>Sem pautas abertas — a próxima rodada é segunda.</BlocoVazio>
          ) : (
            dados.pautas.map((s) => (
              <div
                key={s.id}
                className="rounded-[.5rem] border-l-2 bg-white/4 p-3"
                style={{ borderLeftColor: comAlfa("#00a4ff", 0.6) }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-azureClaro" />
                    <span className="text-sm font-bold">{s.title}</span>
                  </div>
                  <span className="numero shrink-0 text-sm">{numero(s.priority, 0)}</span>
                </div>
                {s.rationale ? (
                  <p className="mt-1 text-xs text-muted">{s.rationale}</p>
                ) : null}
              </div>
            ))
          )}
        </Cartao>

        <Cartao
          titulo="O que os dados dizem"
          rodape={
            <Link to="/cerebro" className="text-azureClaro hover:underline">
              ver o cérebro
            </Link>
          }
        >
          {dados.insights.length === 0 ? (
            <BlocoVazio>
              O cérebro ainda não tem aprendizados. Eles nascem da análise automática sobre os
              posts coletados.
            </BlocoVazio>
          ) : (
            dados.insights.map((i) => (
              <div key={i.id} className="space-y-1.5">
                <p className="text-sm text-corpo">{i.statement}</p>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-royal to-azure"
                    style={{ width: `${Math.max(0, Math.min(1, i.strength)) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </Cartao>
      </div>

      <Link to="/kanban" className="secao-entrada cartao block p-4 hover:bg-white/4">
        <h2 className="rotulo mb-3">Produção agora</h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {COLUNAS.map((c) => (
            <span key={c.status} className="flex items-center gap-1.5 text-xs text-muted">
              <Dot cor={c.cor} />
              {c.rotulo}
              <span className="numero text-sm text-txt">{dados.producao[c.status] ?? 0}</span>
            </span>
          ))}
        </div>
      </Link>
    </Revelar>
  );
}

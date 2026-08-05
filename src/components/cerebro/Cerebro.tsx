import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useState } from "react";
import { Brain, ChevronDown, Lightbulb } from "lucide-react";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";

import Markdown from "react-markdown";

import { Revelar } from "@/components/Revelar";
import { AudienciaPede } from "@/components/cerebro/AudienciaPede";
import { CartaoInsight } from "@/components/cerebro/CartaoInsight";
import { Ideias } from "@/components/cerebro/Ideias";
import { useIdeias } from "@/hooks/useIdeias";
import { haQuanto } from "@/components/pautas/CartaoPauta";
import { useCerebro } from "@/hooks/useInteligencia";

export function Cerebro() {
  const { carregando, playbook, ativos, historico, ultimaAnalise } = useCerebro();
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState<"aprendizados" | "ideias">("aprendizados");
  const { ideias } = useIdeias();

  return (
    <Revelar className="space-y-4">
      <CabecalhoTela
        icone={<Brain size={17} />}
        titulo="Cérebro"
        descricao="O playbook vivo da marca e o que a análise contínua aprendeu."
        acoes={<span className="text-xs text-muted">última análise {haQuanto(ultimaAnalise)}</span>}
      />


      <div
        role="tablist"
        aria-label="Seções do Cérebro"
        className="secao-entrada flex items-center gap-1 rounded-[.7rem] border border-line bg-bg2/70 p-1"
      >
        {([
          { valor: "aprendizados", rotulo: "Aprendizados", icone: <Brain size={14} /> },
          { valor: "ideias", rotulo: "Ideias", icone: <Lightbulb size={14} /> },
        ] as const).map((a) => {
          const ativo = aba === a.valor;
          return (
            <button
              key={a.valor}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setAba(a.valor)}
              className={
                "flex h-9 items-center gap-2 rounded-[.55rem] px-3 text-xs transition-colors " +
                (ativo
                  ? "bg-azure/16 font-semibold text-txt shadow-[inset_0_0_0_1px_rgba(0,164,255,.35)]"
                  : "text-muted hover:bg-white/5 hover:text-corpo")
              }
            >
              {a.icone}
              <span className="whitespace-nowrap">{a.rotulo}</span>
              {a.valor === "ideias" && ideias.length > 0 ? (
                <span
                  className={
                    "numero rounded-full px-1.5 py-px text-[.62rem] " +
                    (ativo ? "bg-azure/22 text-azureClaro" : "bg-white/6 text-muted")
                  }
                >
                  {ideias.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {aba === "ideias" ? <Ideias /> : (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="secao-entrada space-y-4">
        <div className="cartao space-y-3 p-5">
          <h2 className="text-sm font-bold text-txt">O que os dados dizem</h2>
          {carregando ? (
            <div className="space-y-2">
              <div className="h-3 w-full esqueleto rounded" />
              <div className="h-3 w-11/12 esqueleto rounded" />
              <div className="h-3 w-2/3 esqueleto rounded" />
            </div>
          ) : playbook ? (
            <div className="prosa">
              <Markdown>{playbook}</Markdown>
            </div>
          ) : (
            <EstadoVazio
              compacto
              titulo="O playbook ainda não foi escrito"
              descricao="Ele nasce da análise contínua automática."
            />
          )}
          <p className="text-xs text-muted">Atualizado automaticamente pela análise contínua.</p>
        </div>

          <AudienciaPede />
        </div>

        <div className="secao-entrada space-y-3">
          <h2 className="text-sm font-bold text-txt">Aprendizados</h2>

          {carregando ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="cartao space-y-2 p-4">
                <div className="h-4 w-3/4 esqueleto rounded" />
                <div className="h-1 w-full esqueleto rounded" />
                <div className="h-3 w-2/3 esqueleto rounded" />
              </div>
            ))
          ) : ativos.length === 0 && historico.length === 0 ? (
            <div className="cartao p-4">
              <EstadoVazio
                titulo="O cérebro ainda não tem aprendizados"
                descricao="Eles nascem da análise automática sobre os posts coletados."
              />
            </div>
          ) : (
            <>
              {ativos.map((i) => (
                <CartaoInsight key={i.id} i={i} />
              ))}

              {historico.length > 0 && (
                <div className="space-y-3">
                  <button
                    type="button"
                    className="btn w-full justify-between"
                    onClick={() => setAberto((v) => !v)}
                    aria-expanded={aberto}
                  >
                    Histórico ({historico.length})
                    <ChevronDown
                      size={15}
                      className={aberto ? "rotate-180 transition-transform" : "transition-transform"}
                    />
                  </button>
                  {aberto && historico.map((i) => <CartaoInsight key={i.id} i={i} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </Revelar>
  );
}

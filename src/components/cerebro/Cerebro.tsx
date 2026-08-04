import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Markdown from "react-markdown";

import { Revelar } from "@/components/Revelar";
import { CartaoInsight } from "@/components/cerebro/CartaoInsight";
import { haQuanto } from "@/components/pautas/CartaoPauta";
import { useCerebro } from "@/hooks/useInteligencia";

export function Cerebro() {
  const { carregando, playbook, ativos, historico, ultimaAnalise } = useCerebro();
  const [aberto, setAberto] = useState(false);

  return (
    <Revelar className="space-y-4">
      <div className="secao-entrada flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">Cérebro</h1>
        <span className="text-xs text-muted">última análise {haQuanto(ultimaAnalise)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="secao-entrada cartao space-y-3 p-5">
          <h2 className="text-sm font-bold text-txt">O que os dados dizem</h2>
          {carregando ? (
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/6" />
              <div className="h-3 w-11/12 rounded bg-white/6" />
              <div className="h-3 w-2/3 rounded bg-white/6" />
            </div>
          ) : playbook ? (
            <div className="prosa">
              <Markdown>{playbook}</Markdown>
            </div>
          ) : (
            <p className="text-sm text-muted">
              O playbook ainda não foi escrito pela análise semanal.
            </p>
          )}
          <p className="text-xs text-muted">Atualizado automaticamente pela análise semanal.</p>
        </div>

        <div className="secao-entrada space-y-3">
          <h2 className="text-sm font-bold text-txt">Aprendizados</h2>

          {carregando ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="cartao space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-white/6" />
                <div className="h-1 w-full rounded bg-white/6" />
                <div className="h-3 w-2/3 rounded bg-white/6" />
              </div>
            ))
          ) : ativos.length === 0 && historico.length === 0 ? (
            <div className="cartao p-8 text-sm text-muted">
              O cérebro ainda não tem aprendizados. Eles nascem da análise automática sobre os posts
              coletados.
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
    </Revelar>
  );
}

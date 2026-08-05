import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useState } from "react";
import { Brain, ChevronDown } from "lucide-react";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";

import Markdown from "react-markdown";

import { Revelar } from "@/components/Revelar";
import { AudienciaPede } from "@/components/cerebro/AudienciaPede";
import { CartaoInsight } from "@/components/cerebro/CartaoInsight";
import { haQuanto } from "@/components/pautas/CartaoPauta";
import { useCerebro } from "@/hooks/useInteligencia";

export function Cerebro() {
  const { carregando, playbook, ativos, historico, ultimaAnalise } = useCerebro();
  const [aberto, setAberto] = useState(false);

  return (
    <Revelar className="space-y-4">
      <CabecalhoTela
        icone={<Brain size={17} />}
        titulo="Cérebro"
        descricao="O playbook vivo da marca e o que a análise semanal aprendeu."
        acoes={<span className="text-xs text-muted">última análise {haQuanto(ultimaAnalise)}</span>}
      />


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
              descricao="Ele nasce da análise semanal automática."
            />
          )}
          <p className="text-xs text-muted">Atualizado automaticamente pela análise semanal.</p>
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
    </Revelar>
  );
}

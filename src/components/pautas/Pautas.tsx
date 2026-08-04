import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { Revelar } from "@/components/Revelar";
import { CartaoPauta, haQuanto } from "@/components/pautas/CartaoPauta";
import { FiltrosPautas, TIPOS_FILTRO } from "@/components/pautas/FiltrosPautas";
import { VazioFiltrado } from "@/components/filtros/VazioFiltrado";
import { PautasEsqueleto } from "@/components/conteudo/Esqueleto";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";
import { usePautas } from "@/hooks/useInteligencia";



export function Pautas() {
  const navigate = useNavigate();
  const {
    lista,
    contagemStatus,
    contagemTipo,
    pilares,
    filtros,
    definir,
    limpar,
    temFiltroExtra,
    carregando,
    ultimaRodada,
    aceitar,
    descartar,
  } = usePautas();

  const ocupado = aceitar.isPending || descartar.isPending;
  const { origem } = useSearch({ from: "/_authenticated/pautas" });
  const doPainel = origem === "painel";
  const limparRecorte = () =>
    void navigate({
      to: "/pautas",
      search: { q: "", status: "todos", tipo: "todos", pilar: "todos", origem: "" },
    });

  const resumoFiltros = [
    filtros.q ? `"${filtros.q}"` : null,
    filtros.tipo !== "todos"
      ? (TIPOS_FILTRO.find((t) => t.valor === filtros.tipo)?.rotulo ?? filtros.tipo)
      : null,
    filtros.pilar !== "todos"
      ? (pilares.find((p) => p.id === filtros.pilar)?.nome ?? "pilar")
      : null,
  ]
    .filter(Boolean)
    .join(" · ");


  return (
    <Revelar className="space-y-4">
      <CabecalhoTela
        icone={<Lightbulb size={17} />}
        titulo="Pautas"
        descricao="O cérebro gera pautas novas toda segunda de manhã, e aprende com o resultado de cada pauta aceita."
        acoes={
          <span className="text-xs text-muted">
            última rodada {haQuanto(ultimaRodada)}
          </span>
        }
      />


      {doPainel ? <FaixaDeContexto recorte="pautas novas" onLimpar={limparRecorte} /> : null}

      <FiltrosPautas
        filtros={filtros}
        definir={definir}
        limpar={limpar}
        contagemStatus={contagemStatus}
        contagemTipo={contagemTipo}
        pilares={pilares}
        total={lista.length}
        temFiltroExtra={temFiltroExtra}
      />

      {carregando ? (
        <div className="secao-entrada">
          <PautasEsqueleto linhas={temFiltroExtra ? 2 : 3} />
        </div>
      ) : lista.length === 0 ? (
        temFiltroExtra ? (
          <VazioFiltrado
            mensagem="Nenhuma pauta encontrada com esses filtros."
            detalhe={resumoFiltros ? `Filtro ativo: ${resumoFiltros}` : undefined}
            acao="limpar filtros"
            onAcao={limpar}
          />
        ) : (
          <VazioFiltrado
            mensagem={
              filtros.status === "new"
                ? "Nenhuma pauta nova. A próxima rodada automática é segunda de manhã."
                : "Nada por aqui ainda."
            }
            acao={doPainel ? "ver todas as pautas" : undefined}
            onAcao={doPainel ? limparRecorte : undefined}
          />
        )
      ) : (

        <div className="secao-entrada space-y-3">
          {lista.map((s) => (
            <CartaoPauta
              key={s.id}
              s={s}
              ocupado={ocupado}
              onAceitar={() =>
                aceitar.mutate(s.id, {
                  onSuccess: ({ id }) => {
                    toast.success("Pauta aceita — post criado.");
                    navigate({ to: "/post/$id", params: { id }, search: { origem: "pautas" } });
                  },
                  onError: (e: Error) => toast.error(e.message),
                })
              }
              onDescartar={() =>
                descartar.mutate(s.id, {
                  onSuccess: () => toast.success("Pauta descartada."),
                  onError: (e: Error) => toast.error(e.message),
                })
              }
            />
          ))}
        </div>
      )}
    </Revelar>
  );
}

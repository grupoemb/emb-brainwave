import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useState } from "react";
import { toast } from "sonner";

import { iniciais } from "@/lib/conteudo";
import { useOrg } from "@/hooks/useOrg";
import { useAprovacoes, useDecidir, useVersoes } from "@/hooks/usePost";
import { Esqueleto, LinhaEsqueleto } from "@/components/conteudo/Esqueleto";
import { AbaAudiencia } from "@/components/conteudo/AudienciaPost";

type Decisao = "approved" | "changes_requested" | "rejected";

const PILL_DECISAO: Record<string, { classe: string; rotulo: string }> = {
  approved: { classe: "pill pill-bom", rotulo: "Aprovado" },
  changes_requested: { classe: "pill pill-alerta", rotulo: "Alterações" },
  rejected: { classe: "pill pill-ruim", rotulo: "Rejeitado" },
};

function dataCurta(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function Avatar({ nome }: { nome: string | null }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-azure/15 text-[.6rem] font-bold text-azureClaro">
      {iniciais(nome ?? "?")}
    </span>
  );
}

function AbaAprovacao({ postId }: { postId: string }) {
  const { canReview } = useOrg();
  const { aprovacoes, carregando } = useAprovacoes(postId);
  const decidir = useDecidir(postId);
  const [nota, setNota] = useState("");

  const ocupado = carregando || decidir.isPending;
  const atual = aprovacoes[0];
  const pill = atual ? PILL_DECISAO[atual.decision] : undefined;

  async function registrar(decision: Decisao) {
    try {
      await decidir.mutateAsync({ decision, note: nota.trim() || null });
      setNota("");
      toast.success("Decisão registrada");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível registrar");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="rotulo">Estado</span>
        {carregando ? (
          <Esqueleto className="h-5 w-20 rounded-full" />
        ) : pill ? (
          <span className={pill.classe}>{pill.rotulo}</span>
        ) : (
          <span className="pill bg-white/6 text-muted">Pendente</span>
        )}
      </div>

      {canReview && (
        <div className="space-y-2">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota (opcional)"
            rows={2}
            className="w-full rounded-[.55rem] border border-line bg-card2 px-3 py-2 text-sm text-corpo outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-primario disabled:opacity-50"
              disabled={ocupado}
              onClick={() => void registrar("approved")}
            >
              Aprovar
            </button>
            <button
              className="btn disabled:opacity-50"
              disabled={ocupado}
              onClick={() => void registrar("changes_requested")}
            >
              Pedir alteração
            </button>
            <button
              className="btn disabled:opacity-50"
              disabled={ocupado}
              onClick={() => void registrar("rejected")}
            >
              Rejeitar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-line pt-3">
        {carregando && (
          <div className="space-y-2">
            <LinhaEsqueleto />
            <LinhaEsqueleto />
          </div>
        )}
        {!carregando && aprovacoes.length === 0 && (
          <EstadoVazio compacto marca={false} titulo="Nenhuma revisão ainda." />
        )}
        {aprovacoes.map((a) => (
          <div key={a.id} className="flex gap-2">
            <Avatar nome={a.revisor_nome} />
            <div className="min-w-0 text-xs">
              <p className="text-corpo">
                {PILL_DECISAO[a.decision]?.rotulo ?? a.decision}
                <span className="text-muted"> · {dataCurta(a.created_at)}</span>
              </p>
              {a.note && <p className="text-muted">{a.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbaVersoes({
  postId,
  aoRestaurar,
}: {
  postId: string;
  aoRestaurar: (texto: string | null, versao: number) => void | Promise<void>;
}) {
  const { versoes, carregando } = useVersoes(postId);
  const [abertaId, setAbertaId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {carregando && (
        <>
          <LinhaEsqueleto />
          <LinhaEsqueleto />
          <LinhaEsqueleto />
        </>
      )}
      {!carregando && versoes.length === 0 && (
        <EstadoVazio compacto marca={false} titulo="Nenhuma versão salva ainda." />
      )}

      {versoes.map((v) => {
        const aberta = abertaId === v.id;
        return (
          <div key={v.id} className="rounded-[.6rem] border border-line bg-card2">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
              onClick={() => setAbertaId(aberta ? null : v.id)}
            >
              <Avatar nome={v.autor_nome} />
              <span className="numero text-xs">v{v.version_no}</span>
              <span className="flex-1 truncate text-xs text-muted">
                {v.autor_nome ?? "Autor desconhecido"}
              </span>
              <span className="text-[.68rem] text-muted">{dataCurta(v.created_at)}</span>
            </button>

            {aberta && (
              <div className="space-y-2 border-t border-line p-3">
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap text-xs text-corpo">
                  {v.body || "Sem conteúdo nesta versão."}
                </p>
                <button
                  className="btn"
                  onClick={() => void aoRestaurar(v.body, v.version_no)}
                >
                  Restaurar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LateralPost({
  postId,
  aoRestaurar,
}: {
  postId: string;
  aoRestaurar: (texto: string | null, versao: number) => void | Promise<void>;
}) {
  const [aba, setAba] = useState<"aprovacao" | "versoes" | "audiencia">("aprovacao");

  return (
    <aside className="cartao secao-entrada h-fit p-4">
      <div className="mb-3 flex gap-2">
        {(
          [
            ["aprovacao", "Aprovação"],
            ["versoes", "Versões"],
            ["audiencia", "Audiência"],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={
              "rotulo rounded-[.5rem] px-3 py-1.5 " +
              (aba === valor ? "bg-azure/14 text-white" : "text-muted hover:text-corpo")
            }
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "aprovacao" ? (
        <AbaAprovacao postId={postId} />
      ) : aba === "versoes" ? (
        <AbaVersoes postId={postId} aoRestaurar={aoRestaurar} />
      ) : (
        <AbaAudiencia postId={postId} />
      )}
    </aside>
  );
}

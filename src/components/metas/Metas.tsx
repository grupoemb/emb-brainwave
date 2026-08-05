import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";

import { CartaoMeta } from "@/components/metas/CartaoMeta";
import { DialogMeta } from "@/components/metas/DialogMeta";
import { ResumoStatus } from "@/components/metas/ResumoStatus";
import { SemMetas } from "@/components/metas/SemMetas";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Skeleton } from "@/components/ui/skeleton";
import { Revelar } from "@/components/Revelar";
import {
  useExcluirMeta,
  useMetas,
  usePerfisMeta,
  useSalvarMeta,
  type FormularioMeta,
} from "@/hooks/useMetas";
import type { Meta, StatusMeta } from "@/lib/metas";

const TODOS = "__todos__";

export function Metas() {
  const { metas, carregando, erro } = useMetas();
  const perfis = usePerfisMeta();
  const salvar = useSalvarMeta();
  const excluir = useExcluirMeta();

  const [perfil, setPerfil] = useState<string>(TODOS);
  const [status, setStatus] = useState<StatusMeta | null>(null);
  const [aberto, setAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Meta | null>(null);
  const [inicial, setInicial] = useState<Partial<FormularioMeta> | null>(null);

  const total = metas.length;

  const visiveis = useMemo(
    () =>
      metas.filter(
        (m) =>
          (perfil === TODOS || m.handle === perfil) && (status === null || m.status === status),
      ),
    [metas, perfil, status],
  );

  function abrirNova(base?: Partial<FormularioMeta>) {
    setEmEdicao(null);
    setInicial(base ?? null);
    setAberto(true);
  }

  function abrirEdicao(m: Meta) {
    setEmEdicao(m);
    setInicial(null);
    setAberto(true);
  }

  return (
    <Revelar className="space-y-5">
      <CabecalhoTela
        icone={<Target size={18} />}
        titulo="Metas"
        descricao="Alvo, ritmo e projeção — o que precisa acontecer por dia para bater."
        acoes={
          <button
            type="button"
            className="btn-primario inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
            onClick={() => abrirNova()}
          >
            <Plus size={15} /> Nova meta
          </button>
        }
      />

      {perfis.length > 0 ? (
        <div className="secao-entrada flex flex-wrap items-center gap-1 rounded-[.6rem] border border-line bg-bg2/70 p-1">
          <span className="rotulo px-1.5 text-[.56rem]">Perfil</span>
          {[TODOS, ...perfis].map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={perfil === h}
              onClick={() => setPerfil(h)}
              className={
                "rounded-[.45rem] px-2.5 py-1 text-xs transition-colors " +
                (perfil === h
                  ? "bg-azure/16 font-semibold text-txt"
                  : "text-muted hover:bg-white/6 hover:text-corpo")
              }
            >
              {h === TODOS ? "Todos" : `@${h}`}
            </button>
          ))}
          <span className="ml-auto px-2 text-[.7rem] text-muted">
            {visiveis.length === total ? (
              <>
                <span className="numero text-corpo">{total}</span>{" "}
                {total === 1 ? "meta" : "metas"}
              </>
            ) : (
              <>
                <span className="numero text-corpo">{visiveis.length}</span> de{" "}
                <span className="numero text-corpo">{total}</span> metas
              </>
            )}
          </span>
        </div>
      ) : null}

      {carregando ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[360px] rounded-[.9rem]" />
          ))}
        </div>
      ) : erro ? (
        <EstadoVazio
          variante="erro"
          titulo="Não deu pra carregar as metas"
          descricao={erro}
        />
      ) : metas.length === 0 ? (
        <SemMetas perfilExemplo={perfis[0] ?? null} aoCriar={abrirNova} />
      ) : (
        <>
          <ResumoStatus metas={metas} filtro={status} aoFiltrar={setStatus} />
          {visiveis.length === 0 ? (
            <EstadoVazio
              variante="filtro"
              compacto
              titulo="Nenhuma meta com esse filtro"
              descricao="Troque o perfil ou o status para ver as outras."
            />
          ) : (
            <div className="animar-troca grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {visiveis.map((m) => (
                <CartaoMeta
                  key={m.id}
                  meta={m}
                  aoEditar={abrirEdicao}
                  aoExcluir={(id) => excluir.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DialogMeta
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        metaEmEdicao={emEdicao}
        inicial={inicial}
        perfis={perfis}
        salvando={salvar.isPending}
        aoSalvar={(f) =>
          salvar.mutate(f, {
            onSuccess: () => {
              setAberto(false);
              setEmEdicao(null);
              setInicial(null);
              // Nenhum filtro pode esconder a meta recém-salva.
              if (!f.id) {
                setStatus(null);
                if (f.handle && perfil !== TODOS && perfil !== f.handle) setPerfil(TODOS);
                if (!f.handle) setPerfil(TODOS);
              }
            },
          })
        }
      />
    </Revelar>
  );
}

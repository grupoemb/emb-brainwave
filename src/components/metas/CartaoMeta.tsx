import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AnelProgresso } from "@/components/metas/AnelProgresso";
import { BlocoPace } from "@/components/metas/BlocoPace";
import { GraficoEvolucaoMeta } from "@/components/metas/GraficoEvolucaoMeta";
import { RitmoSemanal } from "@/components/metas/RitmoSemanal";
import { compacto } from "@/lib/metricas";
import { dataCurta, infoMetrica, rotuloEscopo, STATUS, tituloMeta, type Meta } from "@/lib/metas";

export function CartaoMeta({
  meta,
  aoEditar,
  aoExcluir,
}: {
  meta: Meta;
  aoEditar: (m: Meta) => void;
  aoExcluir: (id: string) => void;
}) {
  const info = infoMetrica(meta.metric);
  const Icone = info.icone;
  const status = STATUS[meta.status];
  const falta = Math.max(0, meta.effective_target - meta.progress);
  const noPrazo = meta.eta ? meta.eta <= meta.end_date : false;
  const [semanaAberta, setSemanaAberta] = useState(false);

  return (
    <article className="cartao secao-entrada flex flex-col gap-3 p-3.5">
      {/* Cabeçalho: identidade + prazo + ações */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[.55rem]"
            style={{ background: `${info.cor}1f`, color: info.cor }}
          >
            <Icone size={15} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-txt">{tituloMeta(meta)}</h2>
            <p className="mt-0.5 truncate text-[.7rem] text-muted">
              {rotuloEscopo(meta.handle)} · {dataCurta(meta.start_date)}–
              {dataCurta(meta.end_date)} · faltam{" "}
              <span className="numero text-corpo">{meta.days_left}</span> dias
              {meta.eta ? (
                <>
                  {" "}
                  · ETA{" "}
                  <span className="numero" style={{ color: noPrazo ? "#3ecf8e" : "#f6bd24" }}>
                    {dataCurta(meta.eta)}
                  </span>
                </>
              ) : (
                " · sem ETA"
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className={status.classe}>{status.rotulo}</span>
          <button
            type="button"
            className="btn grid h-7 w-7 place-items-center"
            title="Editar meta"
            onClick={() => aoEditar(meta)}
          >
            <Pencil size={13} />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="btn grid h-7 w-7 place-items-center"
                title="Excluir meta"
              >
                <Trash2 size={13} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir esta meta?</AlertDialogTitle>
                <AlertDialogDescription>
                  “{tituloMeta(meta)}” sai do acompanhamento. Não dá pra desfazer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => aoExcluir(meta.id)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Progresso: anel pequeno colado ao número */}
      <div className="flex items-center gap-3">
        <AnelProgresso pct={meta.pct} cor={info.cor} tamanho={62} />
        <div className="min-w-0">
          <p className="numero truncate text-xl text-txt">
            {compacto(meta.progress)}
            <span className="text-sm text-muted"> / {compacto(meta.effective_target)}</span>
          </p>
          <p className="mt-0.5 truncate text-[.7rem] text-muted">
            {falta > 0 ? (
              <>
                faltam <span className="numero text-corpo">{compacto(falta)}</span>
              </>
            ) : (
              <span style={{ color: "#3ecf8e" }}>meta batida</span>
            )}
            {meta.metric === "followers" ? ` · hoje em ${compacto(meta.current)}` : ""}
          </p>
        </div>
      </div>

      <BlocoPace meta={meta} />
      <GraficoEvolucaoMeta meta={meta} />

      {meta.buckets.length > 0 ? (
        <div className="border-t border-line pt-2">
          <button
            type="button"
            onClick={() => setSemanaAberta((v) => !v)}
            aria-expanded={semanaAberta}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="rotulo text-[.58rem]">Ritmo por semana</span>
            <ChevronDown
              size={14}
              aria-hidden
              className={"text-muted transition-transform " + (semanaAberta ? "rotate-180" : "")}
            />
          </button>
          {semanaAberta ? (
            <div className="mt-2">
              <RitmoSemanal meta={meta} />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

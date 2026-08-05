import { Pencil, Trash2 } from "lucide-react";

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

  return (
    <article className="cartao secao-entrada space-y-4 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[.6rem]"
            style={{ background: `${info.cor}1f`, color: info.cor }}
          >
            <Icone size={16} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-txt">{tituloMeta(meta)}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {rotuloEscopo(meta.handle)} · {dataCurta(meta.start_date)} a{" "}
              {dataCurta(meta.end_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={status.classe}>{status.rotulo}</span>
          <button
            type="button"
            className="btn h-8 w-8 grid place-items-center"
            title="Editar meta"
            onClick={() => aoEditar(meta)}
          >
            <Pencil size={14} />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="btn h-8 w-8 grid place-items-center" title="Excluir meta">
                <Trash2 size={14} />
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

      <div className="flex flex-wrap items-center gap-4">
        <AnelProgresso pct={meta.pct} cor={info.cor} />
        <div className="min-w-0">
          <p className="numero text-2xl text-txt">
            {compacto(meta.progress)}
            <span className="text-base text-muted"> / {compacto(meta.effective_target)}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
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
      <RitmoSemanal meta={meta} />
    </article>
  );
}

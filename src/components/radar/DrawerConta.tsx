import { ExternalLink, Loader2 } from "lucide-react";

import { PillVx } from "@/components/radar/PillVx";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useReelsDaConta } from "@/hooks/useContas";
import { compacto } from "@/lib/contas";

export function DrawerConta({
  handle,
  aoFechar,
}: {
  handle: string | null;
  aoFechar: () => void;
}) {
  const { data, isPending, error } = useReelsDaConta(handle);
  const reels = data ?? [];

  return (
    <Sheet open={!!handle} onOpenChange={(aberto) => (aberto ? null : aoFechar())}>
      <SheetContent
        side="right"
        className="w-full border-line bg-bg2 p-0 text-txt sm:max-w-[520px]"
      >
        <SheetHeader className="border-b border-line px-5 py-4 text-left">
          <SheetTitle className="text-base font-bold text-txt">
            @{handle} · ranking de reels
          </SheetTitle>
          <span className="rotulo text-[.6rem]">
            {reels.length ? `${reels.length} reels monitorados` : "leitura das coletas"}
          </span>
        </SheetHeader>

        <div className="h-[calc(100vh-84px)] overflow-y-auto px-5 py-4">
          {isPending ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted">
              <Loader2 size={15} className="animate-spin" /> Carregando reels…
            </div>
          ) : error ? (
            <EstadoVazio
              variante="erro"
              titulo="Não foi possível ler os reels"
              descricao={error instanceof Error ? error.message : "Tente de novo em instantes."}
            />
          ) : reels.length === 0 ? (
            <EstadoVazio
              titulo="Aguardando a primeira coleta das contas."
              descricao="Nenhum reel dessa conta foi lido ainda."
            />
          ) : (
            <ol className="space-y-2">
              {reels.map((r, i) => (
                <li key={r.id}>
                  <a
                    href={r.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="cartao flex items-start gap-3 p-3 transition-colors hover:border-azure/40 hover:bg-white/[.03]"
                  >
                    <span className="numero w-6 shrink-0 pt-0.5 text-sm text-muted">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-xs text-corpo">
                        {r.caption ?? "Sem legenda"}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="numero text-sm text-txt">{compacto(r.views)}</span>
                        <PillVx vx={r.vx} />
                        <span className="text-[.68rem] text-muted">
                          alcance <span className="numero">{compacto(r.reach)}</span>
                        </span>
                        <span className="text-[.68rem] text-muted">
                          salvam. <span className="numero">{compacto(r.saves)}</span>
                        </span>
                      </span>
                    </span>
                    <ExternalLink size={13} className="mt-1 shrink-0 text-muted" aria-hidden />
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

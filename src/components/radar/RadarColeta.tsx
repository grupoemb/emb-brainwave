import { useEffect, useMemo, useRef, useState } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Info, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { DialogoItemManual } from "@/components/radar/DialogoItemManual";
import { TabelaReels } from "@/components/radar/TabelaReels";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useEnviarBiblioteca, useRadarScan } from "@/hooks/useRadarScan";
import { handleDaUrl, type RespostaScan } from "@/lib/radar";

const rota = getRouteApi("/_authenticated/radar");

export function RadarColeta() {
  const { handle: handleBusca } = rota.useSearch();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(handleBusca ? `@${handleBusca}` : "");
  const [dialogo, setDialogo] = useState(false);
  const [nicho, setNicho] = useState("");
  const [resultado, setResultado] = useState<RespostaScan | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const disparado = useRef<string | null>(null);

  const scan = useRadarScan();
  const envio = useEnviarBiblioteca();

  const alvo = perfil.trim() ? handleDaUrl(perfil) : "perfil";

  useEffect(() => {
    if (!scan.isPending) return;
    setSegundos(0);
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [scan.isPending]);

  // Vindo do Painel: preenche o handle, dispara a coleta uma vez e limpa a URL.
  useEffect(() => {
    if (!handleBusca || disparado.current === handleBusca) return;
    disparado.current = handleBusca;
    setPerfil(`@${handleBusca}`);
    analisar(handleBusca);
    void navigate({ to: "/radar", search: { aba: "radar" }, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleBusca]);



  function analisar(alvoUrl?: string) {
    const url = (alvoUrl ?? perfil).trim();
    if (!url || scan.isPending) return;
    setErro(null);
    scan.mutate(url, {
      onSuccess: (r) => {
        setResultado(r);
        setSelecionados(new Set(r.reels.slice(0, 5).map((x) => x.id)));
        if (r.reels.length === 0) {
          toast.error("Perfil não encontrado ou sem reels públicos.");
        }
      },
      onError: (e) => {
        setResultado(null);
        setSelecionados(new Set());
        if (e.status === 404) {
          toast.error("Perfil não encontrado ou sem reels públicos.");
          setErro(null);
        } else {
          setErro(e.mensagem);
          toast.error("A coleta falhou.");
        }
      },
    });
  }

  const escolhidos = useMemo(
    () => (resultado?.reels ?? []).filter((r) => selecionados.has(r.id)),
    [resultado, selecionados],
  );

  function enviar() {
    if (!resultado || escolhidos.length === 0) return;
    envio.mutate(
      { reels: escolhidos, handle: resultado.handle, nicho },
      {
        onSuccess: ({ ok, falhas }) => {
          if (ok > 0) toast.success(`${ok} reels na Biblioteca`);
          if (falhas > 0) toast.error(`${falhas} não puderam ser salvos.`);
          setSelecionados(new Set());
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="cartao space-y-3 p-4">
        <label className="block">
          <span className="rotulo mb-1.5 block">Colar link do perfil</span>
          <div className="flex flex-wrap gap-2">
            <input
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  analisar();
                }
              }}
              placeholder="https://instagram.com/perfil"
              disabled={scan.isPending}
              className="min-w-[14rem] flex-1 rounded-[.55rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none focus:ring-2 focus:ring-azure/40 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => analisar()}
              className="btn-primario flex items-center gap-1.5 px-4 py-2 text-xs"
              disabled={!perfil.trim() || scan.isPending}
            >
              {scan.isPending ? (
                <Loader2 size={13} className="animate-spin" aria-hidden />
              ) : (
                <Search size={13} aria-hidden />
              )}
              {scan.isPending ? "Coletando…" : "Analisar"}
            </button>
          </div>
        </label>

        {scan.isPending ? (
          <div
            className="rounded-[.6rem] border border-azure/30 bg-azure/[.08] p-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <Loader2 size={14} className="mt-0.5 shrink-0 animate-spin text-azureClaro" aria-hidden />
              <div className="flex-1">
                <p className="text-xs text-txt">
                  Coletando os reels de @{alvo}… isso leva até 1 minuto
                </p>
                <p className="mt-0.5 text-[.68rem] text-muted">
                  Não feche esta aba — <span className="numero">{segundos}</span>s de leitura.
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 barra-radar animate-[barra-radar_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-royal to-cyan" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {erro ? (
          <div className="rounded-[.6rem] border border-line border-l-[3px] border-l-[#ff7a6b] bg-white/[.03] p-3">
            <p className="rotulo text-[.6rem] text-[#ff7a6b]">falha na coleta</p>
            <p className="mt-1 text-xs text-corpo">{erro}</p>
            <button type="button" onClick={() => analisar()} className="btn mt-2 px-3 py-1.5 text-xs">
              Tentar de novo
            </button>
          </div>
        ) : null}

        <div className="flex items-start gap-2 rounded-[.6rem] border border-line bg-white/4 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-azureClaro" />
          <p className="text-xs text-corpo">
            A coleta lê os reels públicos do perfil e calcula o vx de cada um contra a mediana do
            próprio perfil. Também dá para colar um reel específico no item manual.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={() => setDialogo(true)}
          >
            <Plus size={13} />
            Adicionar item manual
          </button>
        </div>
      </div>

      {resultado && resultado.reels.length > 0 ? (
        <>
          <TabelaReels
            reels={resultado.reels}
            handle={resultado.handle}
            total={resultado.count}
            mediana={resultado.median}
            selecionados={selecionados}
            aoAlternar={(id) =>
              setSelecionados((s) => {
                const n = new Set(s);
                if (n.has(id)) n.delete(id);
                else n.add(id);
                return n;
              })
            }
            aoAlternarTodos={(marcar) =>
              setSelecionados(marcar ? new Set(resultado.reels.map((r) => r.id)) : new Set())
            }
          />

          <div className="cartao flex flex-wrap items-end gap-3 p-4">
            <label className="min-w-[12rem] flex-1">
              <span className="rotulo mb-1.5 block">Nicho</span>
              <input
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="ex.: imobiliário, saúde, moda"
                disabled={envio.isPending}
                className="w-full rounded-[.55rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none focus:ring-2 focus:ring-azure/40 disabled:opacity-60"
              />
            </label>

            <div className="flex items-center gap-3">
              {envio.progresso ? (
                <span className="text-xs text-muted" role="status" aria-live="polite">
                  salvando <span className="numero">{envio.progresso.atual}</span> de{" "}
                  <span className="numero">{envio.progresso.total}</span>…
                </span>
              ) : null}
              <button
                type="button"
                onClick={enviar}
                disabled={escolhidos.length === 0 || envio.isPending}
                className="btn-primario flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-60"
              >
                {envio.isPending ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden />
                ) : (
                  <Plus size={13} aria-hidden />
                )}
                Adicionar <span className="numero">{escolhidos.length}</span> à Biblioteca
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="cartao overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <h2 className="rotulo">Reels encontrados</h2>
          </div>
          <div className="px-4 py-4">
            <EstadoVazio
              titulo="Nenhum reel coletado ainda"
              descricao="Cole o link de um perfil acima e clique em Analisar — a leitura leva até 1 minuto."
            />
          </div>
        </div>
      )}

      <DialogoItemManual aberto={dialogo} aoFechar={() => setDialogo(false)} />
    </div>
  );
}

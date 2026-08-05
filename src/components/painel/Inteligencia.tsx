import { Check, Clock, Flame, Sparkles } from "lucide-react";

import { EstadoVazio } from "@/components/ui/EstadoVazio";
import {
  useAlertas,
  useMelhorHorario,
  useTaxasPainel,
  type AlertaPainel,
} from "@/hooks/useInteligencia";
import { compacto, numero } from "@/lib/metricas";

type Chip = {
  rotulo: string;
  valor: number | null;
  sufixo?: string;
  casas?: number;
  /** Referência para colorir: acima = bom, metade = alerta. */
  referencia?: number;
};

function corDoChip(c: Chip) {
  if (c.valor === null) return "border-line text-muted";
  if (c.referencia === undefined) return "border-line text-corpo";
  if (c.valor >= c.referencia) return "border-bom/35 bg-bom/10 text-bom";
  if (c.valor >= c.referencia / 2) return "border-alerta/35 bg-alerta/10 text-alerta";
  return "border-ruim/30 bg-ruim/8 text-ruim";
}

function ChipKpi({ chip }: { chip: Chip }) {
  const valor =
    chip.valor === null ? "—" : `${numero(chip.valor, chip.casas ?? 1)}${chip.sufixo ?? ""}`;
  return (
    <div
      className={
        "flex min-w-[8.5rem] flex-1 items-baseline justify-between gap-2 rounded-[.6rem] border px-3 py-2 " +
        corDoChip(chip)
      }
    >
      <span className="rotulo text-[.58rem]">{chip.rotulo}</span>
      <span className="numero text-sm">{valor}</span>
    </div>
  );
}

function corDaSeveridade(s: string) {
  if (s === "good") return "text-bom";
  if (s === "warn") return "text-ruim";
  return "text-corpo";
}

function bordaDaSeveridade(s: string) {
  if (s === "good") return "border-bom/35 bg-bom/[.06]";
  if (s === "warn") return "border-ruim/35 bg-ruim/[.06]";
  return "border-line bg-white/[.02]";
}

function BotaoVisto({ alerta, aoMarcar }: { alerta: AlertaPainel; aoMarcar: (id: string) => void }) {
  if (alerta.seen)
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-[.68rem] text-muted">
        <Check size={11} aria-hidden /> visto
      </span>
    );
  return (
    <button
      type="button"
      className="btn shrink-0 px-2 py-0.5 text-[.68rem]"
      onClick={() => aoMarcar(alerta.id)}
    >
      marcar como visto
    </button>
  );
}

export function Inteligencia({ dias, perfil }: { dias: number; perfil: string | null }) {
  const taxas = useTaxasPainel(dias, perfil);
  const horario = useMelhorHorario(perfil);
  const { alertas, naoVistos, carregando: carregandoAlertas, marcarVisto } = useAlertas();

  const t = taxas.data?.taxas ?? {};
  const c = taxas.data?.conteudo ?? {};

  const chips: Chip[] = [
    { rotulo: "ERR", valor: t["err_pct"] ?? null, sufixo: "%", referencia: 3 },
    { rotulo: "Save rate", valor: t["save_rate_pct"] ?? null, sufixo: "%", referencia: 1 },
    { rotulo: "Share rate", valor: t["share_rate_pct"] ?? null, sufixo: "%", referencia: 1 },
    { rotulo: "Reach rate", valor: t["reach_rate_pct"] ?? null, sufixo: "%", referencia: 30 },
    { rotulo: "Seguidores/post", valor: c["follows_por_post"] ?? null, casas: 1 },
    { rotulo: "Gancho Reels", valor: c["reels_hook_pct"] ?? null, sufixo: "%", referencia: 50 },
    { rotulo: "Watch Reels", valor: c["reels_watch_s"] ?? null, sufixo: "s", casas: 1 },
  ];

  const janelas = (horario.data ?? []).slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="rotulo flex items-center gap-1.5">
          <Sparkles size={12} color="#00e7ff" aria-hidden />
          Inteligência
        </h2>
        <span className="text-[.7rem] text-muted">
          taxas, janela de publicação e leitura automática
        </span>
      </div>

      {/* 1 · Faixa de taxas */}
      <div className="cartao p-3">
        {taxas.isPending ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="esqueleto h-[2.4rem] min-w-[8.5rem] flex-1 rounded-[.6rem]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <ChipKpi key={chip.rotulo} chip={chip} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 2 · Melhor horário */}
        <div className="cartao p-4">
          <h3 className="rotulo mb-3 flex items-center gap-1.5">
            <Clock size={12} aria-hidden />
            Melhor horário para postar
          </h3>
          {horario.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="esqueleto h-8 rounded-[.5rem]" />
              ))}
            </div>
          ) : janelas.length === 0 ? (
            <EstadoVazio
              compacto
              marca={false}
              titulo="Ainda sem janelas suficientes para recomendar."
            />
          ) : (
            <ol className="space-y-2">
              {janelas.map((j, i) => (
                <li
                  key={`${j.dia}-${j.faixa}-${i}`}
                  className="flex items-baseline gap-2 rounded-[.55rem] border border-line px-3 py-2"
                >
                  <span className="numero text-xs text-muted">{i + 1}</span>
                  <span className="text-sm text-txt">
                    {j.dia ?? "—"} {j.faixa ?? ""}
                  </span>
                  <span className="ml-auto text-right text-[.7rem] text-muted">
                    RX {numero(j.rx_medio, 2)}× · alcance médio {compacto(j.alcance_medio)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* 3 · Alertas / leitura da semana */}
        <div className="cartao p-4 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="rotulo">Alertas · leitura da semana</h3>
            {naoVistos > 0 ? (
              <span className="pill pill-alerta">{naoVistos} não vistos</span>
            ) : null}
          </div>

          {carregandoAlertas ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="esqueleto h-12 rounded-[.6rem]" />
              ))}
            </div>
          ) : alertas.length === 0 ? (
            <EstadoVazio
              compacto
              marca={false}
              titulo="Nenhum alerta por aqui."
              descricao="A leitura da semana aparece assim que a rotina de análise rodar."
            />
          ) : (
            <ul className="space-y-2">
              {alertas.map((a) =>
                a.kind === "digest" ? (
                  <li
                    key={a.id}
                    className={
                      "rounded-[.7rem] border p-3 " + bordaDaSeveridade(a.severity)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className={"text-sm font-semibold " + corDaSeveridade(a.severity)}>
                        {a.title}
                      </p>
                      <BotaoVisto alerta={a} aoMarcar={(id) => marcarVisto.mutate(id)} />
                    </div>
                    {a.body ? (
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-corpo">
                        {a.body}
                      </p>
                    ) : null}
                  </li>
                ) : (
                  <li
                    key={a.id}
                    className="flex items-start gap-2 rounded-[.6rem] border border-line px-3 py-2"
                  >
                    {a.kind === "anomaly" ? (
                      <Flame size={13} className="mt-0.5 shrink-0 text-alerta" aria-hidden />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className={"text-sm " + corDaSeveridade(a.severity)}>{a.title}</p>
                      {a.body ? <p className="text-xs text-muted">{a.body}</p> : null}
                    </div>
                    <BotaoVisto alerta={a} aoMarcar={(id) => marcarVisto.mutate(id)} />
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

import { Fragment } from "react";

import { compacto, numero } from "@/lib/metricas";
import type { CelulaCalorPainel, MixFormato } from "@/lib/painel.tipos";

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const FAIXAS = ["0h", "3h", "6h", "9h", "12h", "15h", "18h", "21h"];

const ROTULO_FORMATO: Record<string, string> = {
  reel: "Reels",
  carousel: "Carrossel",
  image: "Imagem",
  story: "Story",
  video_long: "Vídeo longo",
  short: "Short",
  text: "Texto",
  article: "Artigo",
  other: "Outro",
  outro: "Outro",
};

export function JanelaPublicacao({
  grade,
  max,
}: {
  grade: CelulaCalorPainel[];
  max: number;
}) {
  const melhor = grade.reduce<CelulaCalorPainel | null>(
    (m, c) => ((c.alcanceMedio ?? 0) > (m?.alcanceMedio ?? 0) ? c : m),
    null,
  );

  return (
    <div className="cartao p-4">
      <h2 className="rotulo mb-1">Melhores janelas</h2>
      <p className="mb-3 text-xs text-muted">
        {melhor && melhor.alcanceMedio
          ? `Pico em ${DIAS[melhor.dia]} às ${FAIXAS[melhor.faixa]} — ${compacto(melhor.alcanceMedio)} de alcance médio.`
          : "Sem leituras suficientes para cruzar dia e horário."}
      </p>
      <div className="grid grid-cols-[2rem_repeat(8,minmax(0,1fr))] gap-1">
        <span />
        {FAIXAS.map((f) => (
          <span key={f} className="numero text-center text-[.58rem] text-muted">
            {f}
          </span>
        ))}
        {DIAS.map((d, dia) => (
          <Fragment key={d}>
            <span className="numero self-center text-[.62rem] text-muted">
              {d}
            </span>
            {FAIXAS.map((_, faixa) => {
              const c = grade.find((x) => x.dia === dia && x.faixa === faixa);
              const v = c?.alcanceMedio ?? 0;
              const intensidade = max > 0 ? v / max : 0;
              return (
                <span
                  key={`${dia}-${faixa}`}
                  title={
                    c?.n
                      ? `${DIAS[dia]} ${FAIXAS[faixa]} · ${c.n} post(s) · ${compacto(v)} alcance médio`
                      : `${DIAS[dia]} ${FAIXAS[faixa]} · sem posts`
                  }
                  className="h-5 rounded-[.25rem] border border-line"
                  style={{
                    background:
                      intensidade > 0
                        ? `rgba(0,164,255,${0.12 + intensidade * 0.68})`
                        : "rgba(255,255,255,.03)",
                  }}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function MixDeFormatos({ mix }: { mix: MixFormato[] }) {
  const total = mix.reduce((t, m) => t + m.posts, 0);

  return (
    <div className="cartao p-4">
      <h2 className="rotulo mb-3">Mix de formatos</h2>
      {mix.length === 0 ? (
        <p className="text-xs text-muted">Nenhum post publicado na janela.</p>
      ) : (
        <div className="space-y-2.5">
          {mix.map((m) => {
            const pct = total > 0 ? (m.posts / total) * 100 : 0;
            return (
              <div key={m.formato}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-corpo">
                    {ROTULO_FORMATO[m.formato] ?? m.formato}
                  </span>
                  <span className="numero shrink-0 text-muted">
                    {m.posts} · {compacto(m.alcance)}
                    {m.rxMedio !== null ? ` · ${numero(m.rxMedio, 2)}×` : ""}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-royal to-cyan"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

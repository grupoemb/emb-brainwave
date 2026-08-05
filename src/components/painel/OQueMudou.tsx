import type { Manchete } from "@/lib/painel.leitura";

const TOM = {
  bom: { cor: "#3ecf8e", texto: "text-txt" },
  ruim: { cor: "#ff7a6b", texto: "text-txt" },
  neutro: { cor: "#8294ab", texto: "text-corpo" },
} as const;

export function OQueMudou({ itens }: { itens: Manchete[] }) {
  return (
    <section className="cartao p-4">
      <h2 className="rotulo mb-2.5">O que mudou</h2>
      <div className="space-y-2">
        {itens.map((m, i) => {
          const t = TOM[m.tom];
          return (
            <p key={i} className={"flex items-start gap-2.5 text-sm font-medium " + t.texto}>
              <span
                aria-hidden
                className="mt-[.42rem] inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: t.cor, boxShadow: `0 0 10px ${t.cor}66` }}
              />
              <span className="min-w-0">{m.texto}</span>
            </p>
          );
        })}
      </div>
    </section>
  );
}

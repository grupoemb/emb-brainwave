import { forwardRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PropsGatilho = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  rotulo: string;
  valor: string;
  destacado: boolean;
  aberto: boolean;
};

export const GatilhoFiltro = forwardRef<HTMLButtonElement, PropsGatilho>(function GatilhoFiltro(
  { rotulo, valor, destacado, aberto, className, ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...resto}
      className={
        "flex min-w-[8.5rem] flex-1 items-center gap-2 rounded-[.6rem] border px-3 py-1.5 text-left transition-colors sm:flex-none " +
        (destacado
          ? "border-azure/40 bg-azure/14 "
          : "border-line bg-card hover:border-lineForte ") +
        (aberto ? "border-azure/50 " : "") +
        (className ?? "")
      }
    >
      <span className="min-w-0 flex-1">
        <span className="rotulo block leading-none">{rotulo}</span>
        <span
          className={
            "mt-1 block truncate text-xs font-medium leading-none " +
            (destacado ? "text-txt" : "text-corpo")
          }
        >
          {valor}
        </span>
      </span>
      <ChevronDown
        size={14}
        className={
          "shrink-0 text-muted transition-transform duration-200 " + (aberto ? "rotate-180" : "")
        }
      />
    </button>
  );
});

export function ItemOpcao({
  ativo,
  onClick,
  cor,
  contagem,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  cor?: string | null;
  contagem?: number | undefined;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 rounded-[.45rem] px-2.5 py-2 text-left text-xs transition-colors " +
        (ativo ? "bg-azure/14 font-semibold text-white" : "text-corpo hover:bg-white/[.06]")
      }
    >
      {cor ? (
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cor }} />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {typeof contagem === "number" ? (
        <span className="numero shrink-0 text-[.68rem] text-muted">{contagem}</span>
      ) : null}
      {ativo ? <Check size={13} className="shrink-0 text-azureClaro" /> : null}
    </button>
  );
}

export function PainelFiltro({
  children,
  largura = "w-56",
}: {
  children: React.ReactNode;
  largura?: string;
}) {
  return (
    <PopoverContent
      align="start"
      sideOffset={6}
      className={
        largura +
        " rounded-[.7rem] border-line bg-card p-1.5 shadow-[0_10px_34px_-18px_rgb(0_0_0/.6)]"
      }
    >
      {children}
    </PopoverContent>
  );
}

export type OpcaoFiltro<T extends string> = {
  valor: T;
  rotulo: string;
  cor?: string | null;
  contagem?: number;
};

export function MenuFiltro<T extends string>({
  rotulo,
  valor,
  opcoes,
  onEscolher,
  padrao,
  largura = "w-56",
  vazio = "Nada por aqui.",
}: {
  rotulo: string;
  valor: T;
  opcoes: OpcaoFiltro<T>[];
  onEscolher: (v: T) => void;
  /** Valor considerado "sem recorte" — não destaca o gatilho. */
  padrao: T;
  largura?: string;
  vazio?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const ativa = opcoes.find((o) => o.valor === valor);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <GatilhoFiltro
          rotulo={rotulo}
          valor={ativa?.rotulo ?? "—"}
          destacado={valor !== padrao}
          aberto={aberto}
        />
      </PopoverTrigger>
      <PainelFiltro largura={largura}>
        {opcoes.length === 0 ? (
          <p className="px-2.5 py-3 text-xs text-muted">{vazio}</p>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {opcoes.map((o, i) => (
              <div key={o.valor}>
                {i === 1 && opcoes[0]?.valor === padrao ? (
                  <div className="my-1 h-px bg-line" />
                ) : null}
                <ItemOpcao
                  ativo={valor === o.valor}
                  cor={o.cor ?? null}
                  contagem={o.contagem}
                  onClick={() => {
                    onEscolher(o.valor);
                    setAberto(false);
                  }}
                >
                  {o.rotulo}
                </ItemOpcao>
              </div>
            ))}
          </div>
        )}
      </PainelFiltro>
    </Popover>
  );
}

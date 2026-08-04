export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden className={"bg-white/6 " + className} />;
}

export function LinhaEsqueleto() {
  return (
    <div className="flex items-center gap-2 rounded-[.6rem] border border-line bg-card2 px-3 py-2">
      <Esqueleto className="h-6 w-6 rounded-full" />
      <Esqueleto className="h-3 w-10 rounded" />
      <Esqueleto className="h-3 flex-1 rounded" />
      <Esqueleto className="h-3 w-16 rounded" />
    </div>
  );
}

export function PostDetalheEsqueleto() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="cartao flex items-center gap-3 p-4">
          <Esqueleto className="h-5 w-5 rounded" />
          <Esqueleto className="h-5 flex-1 rounded" />
          <Esqueleto className="h-5 w-20 rounded-full" />
        </div>

        <div className="cartao space-y-3 p-4">
          <Esqueleto className="h-3 w-16 rounded" />
          <Esqueleto className="h-56 w-full rounded-[.55rem]" />
        </div>

        <div className="cartao grid gap-3 p-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Esqueleto className="h-3 w-20 rounded" />
              <Esqueleto className="h-9 w-full rounded-[.55rem]" />
            </div>
          ))}
        </div>

        <div className="cartao space-y-3 p-4">
          <Esqueleto className="h-3 w-14 rounded" />
          <Esqueleto className="h-20 w-full rounded-[.7rem]" />
        </div>
      </div>

      <div className="cartao h-fit space-y-3 p-4">
        <div className="flex gap-2">
          <Esqueleto className="h-7 w-24 rounded-[.5rem]" />
          <Esqueleto className="h-7 w-20 rounded-[.5rem]" />
        </div>
        <Esqueleto className="h-5 w-24 rounded-full" />
        <LinhaEsqueleto />
        <LinhaEsqueleto />
      </div>
    </div>
  );
}

/**
 * Esqueleto do kanban. Com `foco`, a coluna em destaque vem em tamanho normal
 * e as demais em largura reduzida.
 */
export function KanbanEsqueleto({
  colunas,
  foco,
}: {
  colunas: { status: string; rotulo: string }[];
  foco?: string | null;
}) {
  return (
    <div className="flex gap-3 overflow-x-hidden pb-2">
      {colunas.map((c) => {
        const emFoco = !foco || c.status === foco;
        return (
          <div
            key={c.status}
            className={
              "shrink-0 rounded-xl bg-bg2 p-3 " + (emFoco ? "w-[272px]" : "w-[132px] opacity-60")
            }
          >
            <Esqueleto className="mb-3 h-3 w-20 rounded" />
            <div className="flex flex-col gap-[10px]">
              {Array.from({ length: emFoco ? 3 : 1 }).map((_, i) => (
                <Esqueleto key={i} className="h-16 w-full rounded-[.6rem]" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Esqueleto de faixa semanal (7 colunas), usado quando o recorte é "próximos 7 dias". */
export function SemanaEsqueleto() {
  return (
    <div className="cartao p-3">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Esqueleto key={i} className="mx-auto h-3 w-8 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Esqueleto key={i} className="h-28 rounded-[.5rem]" />
        ))}
      </div>
    </div>
  );
}


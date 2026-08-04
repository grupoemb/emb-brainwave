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

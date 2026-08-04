import { Esqueleto } from "@/components/conteudo/Esqueleto";

export function EsqueletoMetricas() {
  return (
    <div className="space-y-4">
      <div className="cartao space-y-3 p-5">
        <Esqueleto className="h-3 w-40 rounded" />
        <Esqueleto className="h-12 w-64 rounded" />
        <Esqueleto className="h-[54px] w-full rounded-[.7rem]" />
      </div>

      <Esqueleto className="h-[30px] w-64 rounded-[8px]" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="cartao flex min-h-[5.4rem] flex-col justify-between p-3.5">
            <Esqueleto className="h-3 w-20 rounded" />
            <Esqueleto className="h-6 w-24 rounded" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="cartao space-y-3 p-4 lg:col-span-2">
          <Esqueleto className="h-3 w-28 rounded" />
          <Esqueleto className="h-[260px] w-full rounded-[.7rem]" />
        </div>
        <div className="cartao space-y-3 p-4">
          <Esqueleto className="h-3 w-28 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Esqueleto key={i} className="h-9 w-full rounded" />
          ))}
        </div>
      </div>

      <div className="cartao space-y-2 p-4">
        <Esqueleto className="h-[30px] w-40 rounded-[8px]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Esqueleto key={i} className="h-9 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

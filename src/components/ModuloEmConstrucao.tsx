import { Revelar } from "./Revelar";

export function ModuloEmConstrucao({ titulo }: { titulo: string }) {
  return (
    <Revelar className="space-y-4">
      <h1 className="secao-entrada text-lg font-bold">{titulo}</h1>
      <div className="secao-entrada cartao p-8">
        <p className="text-muted">Módulo em construção</p>
      </div>
    </Revelar>
  );
}

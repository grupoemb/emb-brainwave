import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

/** Ícone que gira durante o salvamento e completa a volta antes de parar. */
export function IconeFrescor({ salvando }: { salvando: boolean }) {
  const [girando, setGirando] = useState(false);

  useEffect(() => {
    if (salvando) setGirando(true);
  }, [salvando]);

  return (
    <RefreshCw
      size={13}
      className={girando ? "animate-spin motion-reduce:animate-none" : ""}
      onAnimationIteration={() => {
        if (!salvando) setGirando(false);
      }}
    />
  );
}

/** Texto "salvo há Xs", atualizado a cada segundo. */
export function Frescor({ salvando, salvoEm }: { salvando: boolean; salvoEm: number | null }) {
  const [, forcar] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forcar((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const segundos = salvoEm ? Math.max(0, Math.round((Date.now() - salvoEm) / 1000)) : null;
  const texto = salvando
    ? "salvando…"
    : segundos === null
      ? "sem alterações"
      : segundos < 60
        ? `salvo há ${segundos}s`
        : `salvo há ${Math.round(segundos / 60)}min`;

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <IconeFrescor salvando={salvando} />
      {texto}
    </span>
  );
}

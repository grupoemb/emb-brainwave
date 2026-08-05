import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

/** Trilha de navegação da área de Métricas: Painel › Métricas › aba atual. */
export function TrilhaMetricas({ aba }: { aba: string }) {
  return (
    <nav
      aria-label="Trilha"
      className="secao-entrada flex flex-wrap items-center gap-1 text-xs text-muted"
    >
      <Link to="/" className="text-azureClaro hover:underline">
        Painel
      </Link>
      <ChevronRight size={13} aria-hidden="true" />
      <Link
        to="/metricas"
        search={(prev) => ({ ...prev, aba: "geral" })}
        className="text-azureClaro hover:underline"
      >
        Métricas
      </Link>
      <ChevronRight size={13} aria-hidden="true" />
      <span className="text-corpo">{aba}</span>
    </nav>
  );
}

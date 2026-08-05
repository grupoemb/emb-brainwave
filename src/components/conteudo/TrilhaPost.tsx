import { Link, getRouteApi } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const rotaPost = getRouteApi("/_authenticated/post/$id");

export type OrigemPost = "painel" | "kanban" | "calendario" | "metricas" | "pautas";

const ROTULOS: Record<OrigemPost, string> = {
  painel: "Painel",
  kanban: "Kanban",
  calendario: "Calendário",
  metricas: "Métricas",
  pautas: "Pautas",
};

function ehOrigem(v: string): v is OrigemPost {
  return v in ROTULOS;
}

export function TrilhaPost() {
  const busca = rotaPost.useSearch();
  const origem: OrigemPost = ehOrigem(busca.origem) ? busca.origem : "kanban";
  const rotulo = ROTULOS[origem];

  const destino =
    origem === "painel" ? (
      <Link to="/" className="text-azureClaro hover:underline">
        {rotulo}
      </Link>
    ) : origem === "calendario" ? (
      <Link to="/calendario" className="text-azureClaro hover:underline">
        {rotulo}
      </Link>
    ) : origem === "metricas" ? (
      <Link
        to="/metricas"
        search={{ dias: busca.dias ?? 30 }}
        className="text-azureClaro hover:underline"
      >
        {rotulo}
      </Link>
    ) : origem === "pautas" ? (
      <Link to="/pautas" className="text-azureClaro hover:underline">
        {rotulo}
      </Link>
    ) : (
      <Link to="/kanban" className="text-azureClaro hover:underline">
        {rotulo}
      </Link>
    );

  const botao =
    origem === "painel" ? (
      <Link to="/" className="btn inline-flex items-center gap-1 px-2 py-1 text-xs">
        <ChevronLeft size={14} />
        Voltar ao Painel
      </Link>
    ) : origem === "calendario" ? (
      <Link to="/calendario" className="btn inline-flex items-center gap-1 px-2 py-1 text-xs">
        <ChevronLeft size={14} />
        Voltar ao Calendário
      </Link>
    ) : origem === "metricas" ? (
      <Link
        to="/metricas"
        search={{ dias: busca.dias ?? 30 }}
        className="btn inline-flex items-center gap-1 px-2 py-1 text-xs"
      >
        <ChevronLeft size={14} />
        Voltar às Métricas
      </Link>
    ) : origem === "pautas" ? (
      <Link to="/pautas" className="btn inline-flex items-center gap-1 px-2 py-1 text-xs">
        <ChevronLeft size={14} />
        Voltar às Pautas
      </Link>
    ) : (
      <Link to="/kanban" className="btn inline-flex items-center gap-1 px-2 py-1 text-xs">
        <ChevronLeft size={14} />
        Voltar ao Kanban
      </Link>
    );

  return (
    <div className="secao-entrada flex flex-wrap items-center justify-between gap-2">
      <nav aria-label="Trilha" className="flex items-center gap-1 text-xs">
        {destino}
        <ChevronRight size={14} className="text-muted" aria-hidden="true" />
        <span className="text-muted">Post</span>
      </nav>
      {botao}
    </div>
  );
}

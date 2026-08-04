import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Central de Conteúdo EMB" },
      { name: "description", content: "Agenda editorial de publicações da EMB." },
      { property: "og:title", content: "Calendário — Central de Conteúdo EMB" },
      { property: "og:description", content: "Agenda editorial de publicações da EMB." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Calendário" />,
});

import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/cerebro")({
  head: () => ({
    meta: [
      { title: "Cérebro — Central de Conteúdo EMB" },
      { name: "description", content: "Base de conhecimento e contexto da marca." },
      { property: "og:title", content: "Cérebro — Central de Conteúdo EMB" },
      { property: "og:description", content: "Base de conhecimento e contexto da marca." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Cérebro" />,
});

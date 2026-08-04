import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/_authenticated/kanban")({
  head: () => ({
    meta: [
      { title: "Kanban — Central de Conteúdo EMB" },
      { name: "description", content: "Fluxo de produção de conteúdo por etapas." },
      { property: "og:title", content: "Kanban — Central de Conteúdo EMB" },
      { property: "og:description", content: "Fluxo de produção de conteúdo por etapas." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Kanban" />,
});

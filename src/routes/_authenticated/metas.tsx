import { createFileRoute } from "@tanstack/react-router";

import { Metas } from "@/components/metas/Metas";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas — Central de Conteúdo EMB" },
      {
        name: "description",
        content: "Metas de KPI com ritmo, projeção e evolução por perfil.",
      },
      { property: "og:title", content: "Metas — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Metas de KPI com ritmo, projeção e evolução por perfil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Metas,
});

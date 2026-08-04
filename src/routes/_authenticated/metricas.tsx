import { createFileRoute } from "@tanstack/react-router";
import { Metricas } from "@/components/metricas/Metricas";

export const Route = createFileRoute("/_authenticated/metricas")({
  head: () => ({
    meta: [
      { title: "Métricas — Central de Conteúdo EMB" },
      { name: "description", content: "Desempenho dos conteúdos publicados." },
      { property: "og:title", content: "Métricas — Central de Conteúdo EMB" },
      { property: "og:description", content: "Desempenho dos conteúdos publicados." },
    ],
  }),
  component: Metricas,
});

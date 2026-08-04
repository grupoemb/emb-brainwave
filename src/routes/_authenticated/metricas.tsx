import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Metricas } from "@/components/metricas/Metricas";

const buscaMetricas = z.object({
  dias: fallback(z.number().int(), 30).default(30),
  origem: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_authenticated/metricas")({
  validateSearch: zodValidator(buscaMetricas),
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

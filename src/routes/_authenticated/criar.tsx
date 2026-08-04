import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Estudio } from "@/components/criar/Estudio";

const buscaCriar = z.object({
  tipo: fallback(
    z.enum(["carousel", "headline", "news_card", "caption", "improvement"]),
    "carousel",
  ).default("carousel"),
  brief: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_authenticated/criar")({
  validateSearch: zodValidator(buscaCriar),

  head: () => ({
    meta: [
      { title: "Criar — Central de Conteúdo EMB" },
      { name: "description", content: "Estúdio de geração de conteúdo com IA." },
      { property: "og:title", content: "Criar — Central de Conteúdo EMB" },
      { property: "og:description", content: "Estúdio de geração de conteúdo com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Estudio,
});

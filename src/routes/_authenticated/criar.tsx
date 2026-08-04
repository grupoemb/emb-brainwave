import { createFileRoute } from "@tanstack/react-router";
import { Estudio } from "@/components/criar/Estudio";

export const Route = createFileRoute("/_authenticated/criar")({
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

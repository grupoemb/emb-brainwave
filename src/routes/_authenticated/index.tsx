import { createFileRoute } from "@tanstack/react-router";
import { Painel } from "@/components/painel/Painel";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Painel — Central de Conteúdo EMB" },
      { name: "description", content: "Visão geral da produção de conteúdo com IA da EMB." },
      { property: "og:title", content: "Painel — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Visão geral da produção de conteúdo com IA da EMB.",
      },
    ],
  }),
  component: Painel,
});

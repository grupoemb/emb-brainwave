import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/_authenticated/concorrentes")({
  head: () => ({
    meta: [
      { title: "Concorrentes — Central de Conteúdo EMB" },
      { name: "description", content: "Acompanhamento de concorrentes. Em breve." },
      { property: "og:title", content: "Concorrentes — Central de Conteúdo EMB" },
      { property: "og:description", content: "Acompanhamento de concorrentes. Em breve." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Concorrentes" />,
});

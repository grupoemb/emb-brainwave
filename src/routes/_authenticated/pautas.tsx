import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/_authenticated/pautas")({
  head: () => ({
    meta: [
      { title: "Pautas — Central de Conteúdo EMB" },
      { name: "description", content: "Banco de pautas e ideias de conteúdo." },
      { property: "og:title", content: "Pautas — Central de Conteúdo EMB" },
      { property: "og:description", content: "Banco de pautas e ideias de conteúdo." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Pautas" />,
});

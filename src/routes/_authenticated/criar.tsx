import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/_authenticated/criar")({
  head: () => ({
    meta: [
      { title: "Criar — Central de Conteúdo EMB" },
      { name: "description", content: "Criação de conteúdo assistida por IA." },
      { property: "og:title", content: "Criar — Central de Conteúdo EMB" },
      { property: "og:description", content: "Criação de conteúdo assistida por IA." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Criar" />,
});

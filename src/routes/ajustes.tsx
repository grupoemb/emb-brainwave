import { createFileRoute } from "@tanstack/react-router";
import { ModuloEmConstrucao } from "@/components/ModuloEmConstrucao";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — Central de Conteúdo EMB" },
      { name: "description", content: "Configurações da Central de Conteúdo EMB." },
      { property: "og:title", content: "Ajustes — Central de Conteúdo EMB" },
      { property: "og:description", content: "Configurações da Central de Conteúdo EMB." },
    ],
  }),
  component: () => <ModuloEmConstrucao titulo="Ajustes" />,
});

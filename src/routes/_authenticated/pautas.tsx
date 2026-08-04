import { createFileRoute } from "@tanstack/react-router";
import { Pautas } from "@/components/pautas/Pautas";

export const Route = createFileRoute("/_authenticated/pautas")({
  head: () => ({
    meta: [
      { title: "Pautas — Central de Conteúdo EMB" },
      { name: "description", content: "Pautas sugeridas pela IA e o resultado de cada uma." },
      { property: "og:title", content: "Pautas — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Pautas sugeridas pela IA e o resultado de cada uma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pautas,
});

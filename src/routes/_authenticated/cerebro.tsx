import { createFileRoute } from "@tanstack/react-router";
import { Cerebro } from "@/components/cerebro/Cerebro";

export const Route = createFileRoute("/_authenticated/cerebro")({
  head: () => ({
    meta: [
      { title: "Cérebro — Central de Conteúdo EMB" },
      { name: "description", content: "Playbook da marca e aprendizados da análise semanal." },
      { property: "og:title", content: "Cérebro — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Playbook da marca e aprendizados da análise semanal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cerebro,
});

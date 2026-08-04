import { createFileRoute } from "@tanstack/react-router";
import { Calendario } from "@/components/conteudo/Calendario";

export const Route = createFileRoute("/_authenticated/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Central de Conteúdo EMB" },
      { name: "description", content: "Agenda editorial de publicações da EMB." },
      { property: "og:title", content: "Calendário — Central de Conteúdo EMB" },
      { property: "og:description", content: "Agenda editorial de publicações da EMB." },
    ],
  }),
  component: Calendario,
});

import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Calendario } from "@/components/conteudo/Calendario";

const buscaCalendario = z.object({
  foco: fallback(z.string(), "").default(""),
  origem: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_authenticated/calendario")({
  validateSearch: zodValidator(buscaCalendario),
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

import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Pautas } from "@/components/pautas/Pautas";

const buscaPautas = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "new").default("new"),
  tipo: fallback(z.string(), "todos").default("todos"),
  pilar: fallback(z.string(), "todos").default("todos"),
});

export const Route = createFileRoute("/_authenticated/pautas")({
  validateSearch: zodValidator(buscaPautas),
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

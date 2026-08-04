import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Kanban } from "@/components/conteudo/Kanban";

const buscaKanban = z.object({
  foco: fallback(z.string(), "").default(""),
  origem: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_authenticated/kanban")({
  validateSearch: zodValidator(buscaKanban),
  head: () => ({
    meta: [
      { title: "Kanban — Central de Conteúdo EMB" },
      { name: "description", content: "Fluxo de produção de conteúdo por etapas." },
      { property: "og:title", content: "Kanban — Central de Conteúdo EMB" },
      { property: "og:description", content: "Fluxo de produção de conteúdo por etapas." },
    ],
  }),
  component: Kanban,
});

import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Ajustes } from "@/components/ajustes/Ajustes";

const buscaAjustes = z.object({
  aba: fallback(z.string(), "").default(""),
  secao: fallback(z.string(), "").default(""),
  origem: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_authenticated/ajustes")({
  validateSearch: zodValidator(buscaAjustes),
  head: () => ({
    meta: [
      { title: "Ajustes — Central de Conteúdo EMB" },
      { name: "description", content: "Perfil, equipe, contas, marca e templates de IA." },
      { property: "og:title", content: "Ajustes — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Perfil, equipe, contas, marca e templates de IA.",
      },
    ],
  }),
  component: Ajustes,
});

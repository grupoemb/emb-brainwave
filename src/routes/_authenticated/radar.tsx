import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { Radar } from "@/components/radar/Radar";

const buscaRadar = z.object({
  aba: fallback(z.enum(["radar", "biblioteca"]), "radar").default("radar"),
});

export const Route = createFileRoute("/_authenticated/radar")({
  validateSearch: zodValidator(buscaRadar),
  head: () => ({
    meta: [
      { title: "Reels Radar — Central de Conteúdo EMB" },
      {
        name: "description",
        content: "Radar de reels e biblioteca de padrões que valem estudar.",
      },
      { property: "og:title", content: "Reels Radar — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Radar de reels e biblioteca de padrões que valem estudar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Radar,
});

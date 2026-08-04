import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { PostDetalhe } from "@/components/conteudo/PostDetalhe";

const buscaPost = z.object({
  origem: fallback(z.string(), "kanban").default("kanban"),
  dias: z.number().optional(),
});

export const Route = createFileRoute("/_authenticated/post/$id")({
  validateSearch: zodValidator(buscaPost),

  head: () => ({
    meta: [
      { title: "Post — Central de Conteúdo EMB" },
      { name: "description", content: "Editor completo do post: corpo, mídia, aprovação e versões." },
      { property: "og:title", content: "Post — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Editor completo do post: corpo, mídia, aprovação e versões.",
      },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { id } = Route.useParams();
  return <PostDetalhe id={id} />;
}

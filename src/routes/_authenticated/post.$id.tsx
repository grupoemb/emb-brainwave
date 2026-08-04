import { createFileRoute } from "@tanstack/react-router";

import { PostDetalhe } from "@/components/conteudo/PostDetalhe";

export const Route = createFileRoute("/_authenticated/post/$id")({
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

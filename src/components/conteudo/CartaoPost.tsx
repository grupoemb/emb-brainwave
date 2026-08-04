import { Instagram, Linkedin, Youtube, Music2, Sparkles } from "lucide-react";

import { comAlfa, iniciais, type Canal, type Pilar, type Post } from "@/lib/conteudo";

function IconeCanal({ canal }: { canal: Canal | null }) {
  const props = { size: 13, className: "text-muted shrink-0" } as const;
  if (canal === "instagram") return <Instagram {...props} />;
  if (canal === "linkedin") return <Linkedin {...props} />;
  if (canal === "youtube") return <Youtube {...props} />;
  if (canal === "tiktok") return <Music2 {...props} />;
  return <span className="inline-block h-[13px] w-[13px]" />;
}

function formatarData(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function CartaoPost({
  post,
  pilar,
  onDragStart,
  onClick,
}: {
  post: Post;
  pilar?: Pilar | undefined;
  onDragStart?: (e: React.DragEvent) => void;
  onClick?: () => void;
}) {
  const data = formatarData(post.scheduled_for ?? post.published_at);
  const corPilar = pilar?.color || "#8294ab";
  const daIA = !!post.suggestion_id;

  return (
    <article
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={onClick}
      className="cartao secao-entrada cursor-grab select-none p-[14px] active:cursor-grabbing"
      style={daIA ? { borderLeft: `2px solid ${comAlfa("#00a4ff", 0.6)}` } : undefined}
    >
      <div className="mb-2 flex items-center gap-2">
        <IconeCanal canal={post.channel} />
        {pilar && (
          <span
            className="rotulo truncate rounded-full px-2 py-[1px]"
            style={{
              color: corPilar,
              background: comAlfa(corPilar, 0.13),
              fontSize: "0.62rem",
            }}
          >
            {pilar.name}
          </span>
        )}
      </div>

      <div className="flex items-start gap-1.5">
        {daIA && <Sparkles size={12} className="mt-[3px] shrink-0 text-azureClaro" />}
        <h3 className="line-clamp-2 text-sm font-bold">{post.title}</h3>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div
          title={post.autor_nome || undefined}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-azure/15 text-[0.6rem] font-bold text-azureClaro"
        >
          {iniciais(post.autor_nome || "?")}
        </div>
        {data && <span className="numero text-xs text-muted">{data}</span>}
      </div>
    </article>
  );
}

export { IconeCanal };

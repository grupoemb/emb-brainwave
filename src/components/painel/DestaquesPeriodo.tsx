import { Link } from "@tanstack/react-router";
import { Bookmark, Flame, Heart, ShieldCheck, TrendingUp, UserPlus } from "lucide-react";

import { Dica } from "@/components/painel/Dica";
import { TooltipProvider } from "@/components/ui/tooltip";
import { compacto, numero } from "@/lib/metricas";
import { GLOSSARIO } from "@/lib/glossario";
import type { DestaquesPainel, MelhorPost } from "@/lib/painel.functions";

function Item({
  icone,
  rotulo,
  dica,
  post,
  valor,
  dias,
}: {
  icone: React.ReactNode;
  rotulo: string;
  dica: string;
  post: MelhorPost | null;
  valor: string;
  dias: number;
}) {
  const conteudo = (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[.5rem] px-2 py-1.5 transition-colors hover:bg-white/6">
      <span className="shrink-0">{icone}</span>
      <span className="min-w-0 flex-1">
        <span className="rotulo flex items-center gap-1">
          {rotulo}
          <Dica texto={dica} />
        </span>
        <span className="block truncate text-xs text-corpo">
          {post ? post.title : "—"}
          {post?.conta ? <span className="text-muted"> · @{post.conta}</span> : null}
        </span>
      </span>
      <span className="numero shrink-0 text-sm">{valor}</span>
    </div>
  );

  if (!post) return conteudo;
  return (
    <Link to="/post/$id" params={{ id: post.id }} search={{ origem: "painel", dias }}>
      {conteudo}
    </Link>
  );
}

export function DestaquesPeriodo({
  destaques,
  dias,
}: {
  destaques: DestaquesPainel;
  dias: number;
}) {
  const d = destaques;
  return (
    <TooltipProvider delayDuration={200}>
      <div className="cartao grid gap-1 p-3 sm:grid-cols-2 xl:grid-cols-3">
        <Item
          icone={<TrendingUp size={14} className="text-azureClaro" />}
          rotulo="Melhor alcance"
          dica={GLOSSARIO.melhorAlcance}
          post={d.melhorAlcance}
          valor={compacto(d.melhorAlcance?.alcance ?? null)}
          dias={dias}
        />
        <Item
          icone={<Heart size={14} className="text-azureClaro" />}
          rotulo="Melhor engajamento"
          dica={GLOSSARIO.melhorEngajamento}
          post={d.melhorEngajamento}
          valor={
            d.melhorEngajamento?.engajamento != null
              ? `${numero(d.melhorEngajamento.engajamento, 2)}%`
              : "—"
          }
          dias={dias}
        />
        <Item
          icone={<Flame size={14} color="#f6bd24" />}
          rotulo="Maior rx"
          dica={`${GLOSSARIO.rx} ${GLOSSARIO.maiorRx}`}
          post={d.maiorRx}
          valor={d.maiorRx?.rx != null ? `${numero(d.maiorRx.rx, 2)}×` : "—"}
          dias={dias}
        />
        <Item
          icone={<Bookmark size={14} className="text-azureClaro" />}
          rotulo="Mais salvo"
          dica="Post com o maior número de salvamentos na janela — o sinal mais forte de conteúdo de valor."
          post={d.maisSalvo}
          valor={compacto(d.maisSalvo?.saves ?? null)}
          dias={dias}
        />
        <Item
          icone={<UserPlus size={14} className="text-bom" />}
          rotulo="Mais seguidores"
          dica="Post que mais trouxe seguidores novos na janela."
          post={d.maisSeguidores}
          valor={compacto(d.maisSeguidores?.seguidores ?? null)}
          dias={dias}
        />
        <div className="flex min-w-0 items-center gap-2.5 px-2 py-1.5">
          <ShieldCheck size={14} className="shrink-0 text-bom" />
          <span className="min-w-0 flex-1">
            <span className="rotulo flex items-center gap-1">
              Conta mais consistente
              <Dica texto={`${GLOSSARIO.contaConsistente} ${GLOSSARIO.consistencia}`} />
            </span>
            <span className="block truncate text-xs text-corpo">
              {d.contaConsistente ? `@${d.contaConsistente.conta}` : "—"}
            </span>
          </span>
          <span className="numero shrink-0 text-sm">
            {d.contaConsistente ? `${d.contaConsistente.consistencia}%` : "—"}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import {
  listarPosts,
  listarPilares,
  atualizarStatusPost,
  atualizarAgendamento,
  criarPost,
} from "@/lib/conteudo.functions";
import type { Pilar, Post, Status } from "@/lib/conteudo";

export function usePosts() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(listarPosts);

  const q = useQuery({
    queryKey: ["posts", organizationId],
    enabled: !!organizationId,
    refetchOnWindowFocus: true,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  return { posts: (q.data ?? []) as Post[], carregando: q.isPending, organizationId };
}

export function usePilares() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(listarPilares);

  const q = useQuery({
    queryKey: ["pilares", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
    staleTime: 5 * 60_000,
  });

  const lista = (q.data ?? []) as Pilar[];
  const porId = new Map(lista.map((p) => [p.id, p]));
  return { pilares: lista, pilarPorId: porId };
}

/** Aplica uma alteração otimista na lista de posts em cache. */
function usarCacheOtimista(organizationId: string | null) {
  const queryClient = useQueryClient();
  const chave = ["posts", organizationId] as const;

  return {
    async aplicar(mudar: (posts: Post[]) => Post[]) {
      await queryClient.cancelQueries({ queryKey: chave });
      const anterior = queryClient.getQueryData<Post[]>(chave);
      queryClient.setQueryData<Post[]>(chave, (atual) => mudar(atual ?? []));
      return { anterior };
    },
    restaurar(ctx?: { anterior: Post[] | undefined }) {
      if (ctx?.anterior) queryClient.setQueryData<Post[]>(chave, ctx.anterior);
    },
    invalidar() {
      void queryClient.invalidateQueries({ queryKey: chave });
    },
  };
}

export function useMoverStatus() {
  const { organizationId } = useOrg();
  const cache = usarCacheOtimista(organizationId);
  const mover = useServerFn(atualizarStatusPost);

  return useMutation({
    mutationFn: (v: { id: string; status: Status }) => mover({ data: v }),
    onMutate: (v) =>
      cache.aplicar((posts) => posts.map((p) => (p.id === v.id ? { ...p, status: v.status } : p))),
    onError: (_erro, _v, ctx) => cache.restaurar(ctx),
    onSettled: () => cache.invalidar(),
  });
}

export function useAgendar() {
  const { organizationId } = useOrg();
  const cache = usarCacheOtimista(organizationId);
  const agendar = useServerFn(atualizarAgendamento);

  return useMutation({
    mutationFn: (v: { id: string; scheduled_for: string | null }) => agendar({ data: v }),
    onMutate: (v) =>
      cache.aplicar((posts) =>
        posts.map((p) => (p.id === v.id ? { ...p, scheduled_for: v.scheduled_for } : p)),
      ),
    onError: (_erro, _v, ctx) => cache.restaurar(ctx),
    onSettled: () => cache.invalidar(),
  });
}

export function useCriarPost() {
  const { organizationId } = useOrg();
  const cache = usarCacheOtimista(organizationId);
  const criar = useServerFn(criarPost);

  return useMutation({
    mutationFn: (v: {
      organizationId: string;
      title: string;
      channel: Post["channel"];
      format: Post["format"];
      pillar_id: string | null;
    }) => criar({ data: v }),
    onMutate: (v) =>
      cache.aplicar((posts) => [
        {
          id: `temp-${Date.now()}`,
          organization_id: v.organizationId,
          title: v.title,
          status: "idea",
          channel: v.channel,
          format: v.format,
          hook: null,
          pillar_id: v.pillar_id,
          body: null,
          author_id: null,
          suggestion_id: null,
          scheduled_for: null,
          published_at: null,
          meta: null,
        } as unknown as Post,
        ...posts,
      ]),
    onError: (_erro, _v, ctx) => cache.restaurar(ctx),
    onSettled: () => cache.invalidar(),
  });
}

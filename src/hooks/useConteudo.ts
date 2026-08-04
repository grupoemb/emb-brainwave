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

export function useMoverStatus() {
  const queryClient = useQueryClient();
  const mover = useServerFn(atualizarStatusPost);

  return useMutation({
    mutationFn: (v: { id: string; status: Status }) => mover({ data: v }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAgendar() {
  const queryClient = useQueryClient();
  const agendar = useServerFn(atualizarAgendamento);

  return useMutation({
    mutationFn: (v: { id: string; scheduled_for: string | null }) => agendar({ data: v }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCriarPost() {
  const queryClient = useQueryClient();
  const criar = useServerFn(criarPost);

  return useMutation({
    mutationFn: (v: Parameters<typeof criarPost>[0] extends never ? never : {
      organizationId: string;
      title: string;
      channel: Post["channel"];
      format: Post["format"];
      pillar_id: string | null;
    }) => criar({ data: v }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

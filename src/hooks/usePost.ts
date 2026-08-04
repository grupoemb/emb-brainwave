import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  obterPost,
  atualizarPost,
  listarVersoes,
  criarVersao,
  listarAprovacoes,
  criarAprovacao,
  listarAssets,
  registrarAsset,
  removerAsset,
} from "@/lib/conteudo.functions";

export type CamposPost = {
  title?: string;
  body?: string | null;
  channel?: string | null;
  format?: string | null;
  hook?: string | null;
  pillar_id?: string | null;
  scheduled_for?: string | null;
  cta?: string | null;
};

export function usePost(id: string) {
  const buscar = useServerFn(obterPost);
  const q = useQuery({
    queryKey: ["post", id],
    queryFn: () => buscar({ data: { id } }),
  });
  return { post: q.data ?? null, carregando: q.isPending, erro: q.error };
}

export function useVersoes(postId: string) {
  const buscar = useServerFn(listarVersoes);
  const q = useQuery({
    queryKey: ["post-versoes", postId],
    queryFn: () => buscar({ data: { postId } }),
  });
  return { versoes: q.data ?? [], carregando: q.isPending };
}

export function useAprovacoes(postId: string) {
  const buscar = useServerFn(listarAprovacoes);
  const q = useQuery({
    queryKey: ["post-aprovacoes", postId],
    queryFn: () => buscar({ data: { postId } }),
  });
  return { aprovacoes: q.data ?? [], carregando: q.isPending };
}

export function useAssets(postId: string) {
  const buscar = useServerFn(listarAssets);
  const q = useQuery({
    queryKey: ["post-assets", postId],
    queryFn: () => buscar({ data: { postId } }),
  });
  return { assets: q.data ?? [], carregando: q.isPending };
}

export function useSalvarPost(id: string) {
  const queryClient = useQueryClient();
  const salvar = useServerFn(atualizarPost);

  return useMutation({
    mutationFn: (campos: CamposPost) => salvar({ data: { id, campos: campos as never } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["post", id] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCriarVersao(postId: string) {
  const queryClient = useQueryClient();
  const criar = useServerFn(criarVersao);

  return useMutation({
    mutationFn: (body: string | null) => criar({ data: { postId, body } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post-versoes", postId] }),
  });
}

export function useDecidir(postId: string) {
  const queryClient = useQueryClient();
  const decidir = useServerFn(criarAprovacao);

  return useMutation({
    mutationFn: (v: { decision: "approved" | "changes_requested" | "rejected"; note: string | null }) =>
      decidir({ data: { postId, ...v } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post-aprovacoes", postId] }),
  });
}

export function useAssetsMutations(postId: string) {
  const queryClient = useQueryClient();
  const registrar = useServerFn(registrarAsset);
  const remover = useServerFn(removerAsset);
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["post-assets", postId] });

  const mRegistrar = useMutation({
    mutationFn: (v: { storage_path: string; kind: "image" | "video" | "pdf" | "other" }) =>
      registrar({ data: { postId, ...v } }),
    onSuccess: invalidar,
  });

  const mRemover = useMutation({
    mutationFn: (v: { id: string }) => remover({ data: v }),
    onSuccess: invalidar,
  });

  return { registrar: mRegistrar, remover: mRemover };
}

/** Autosave com debounce; devolve estado de salvamento e o instante do último save. */
export function useAutosave(
  salvar: (campos: CamposPost) => Promise<unknown>,
  atraso = 2000,
) {
  const [salvando, setSalvando] = useState(false);
  const [salvoEm, setSalvoEm] = useState<number | null>(null);
  const pendente = useRef<CamposPost>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const salvarRef = useRef(salvar);
  salvarRef.current = salvar;

  const api = useMemo(() => {
    async function descarregar() {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      const campos = pendente.current;
      pendente.current = {};
      if (!Object.keys(campos).length) return campos;
      setSalvando(true);
      try {
        await salvarRef.current(campos);
        setSalvoEm(Date.now());
      } finally {
        setSalvando(false);
      }
      return campos;
    }

    function agendar(campos: CamposPost) {
      pendente.current = { ...pendente.current, ...campos };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void descarregar();
      }, atraso);
    }

    return { agendar, descarregar };
  }, [atraso]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { ...api, salvando, salvoEm };
}

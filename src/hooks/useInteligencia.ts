import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import {
  aceitarSugestao,
  descartarSugestao,
  listarSugestoes,
  obterCerebro,
} from "@/lib/inteligencia.functions";

export type FiltroPauta = "new" | "accepted" | "dismissed";

export function usePautas() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const buscar = useServerFn(listarSugestoes);
  const aceitarFn = useServerFn(aceitarSugestao);
  const descartarFn = useServerFn(descartarSugestao);

  const [filtro, setFiltro] = useState<FiltroPauta>("new");

  const q = useQuery({
    queryKey: ["sugestoes", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: ["sugestoes", organizationId] });

  const aceitar = useMutation({
    mutationFn: (suggestionId: string) =>
      aceitarFn({ data: { organizationId: organizationId!, suggestionId } }),
    onSuccess: invalidar,
  });

  const descartar = useMutation({
    mutationFn: (suggestionId: string) =>
      descartarFn({ data: { organizationId: organizationId!, suggestionId } }),
    onSuccess: invalidar,
  });

  const todas = q.data?.sugestoes ?? [];
  const lista = useMemo(() => todas.filter((s) => s.status === filtro), [todas, filtro]);

  const ultimaRodada = q.data?.ultimaRodada ? new Date(q.data.ultimaRodada).getTime() : null;

  return {
    lista,
    contagem: {
      new: todas.filter((s) => s.status === "new").length,
      accepted: todas.filter((s) => s.status === "accepted").length,
      dismissed: todas.filter((s) => s.status === "dismissed").length,
    },
    filtro,
    setFiltro,
    carregando: q.isPending,
    ultimaRodada,
    aceitar,
    descartar,
  };
}

export function useCerebro() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(obterCerebro);

  const q = useQuery({
    queryKey: ["cerebro", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const insights = q.data?.insights ?? [];

  return {
    carregando: q.isPending,
    playbook: q.data?.playbook ?? null,
    ativos: insights.filter((i) => i.status === "active"),
    historico: insights.filter((i) => i.status !== "active"),
    ultimaAnalise: q.data?.ultimaAnalise ? new Date(q.data.ultimaAnalise).getTime() : null,
  };
}

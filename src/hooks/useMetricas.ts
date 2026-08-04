import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { carregarMetricas, listarContasConectadas } from "@/lib/metricas.functions";
import {
  calcularKpis,
  distribuicaoFormatos,
  montarLinhas,
  serieDiaria,
  ultimaColeta,
  type Baseline,
  type Leitura,
  type PostBruto,
} from "@/lib/metricas";

export type Periodo = 7 | 30 | 90;

export function useContasConectadas() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(listarContasConectadas);
  const q = useQuery({
    queryKey: ["contas-conectadas", organizationId],
    enabled: !!organizationId,
    staleTime: 5 * 60_000,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });
  return q.data ?? [];
}

export function useMetricas() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(carregarMetricas);

  const [dias, setDias] = useState<Periodo>(30);
  const [conta, setConta] = useState<string>("todas");
  const [pilar, setPilar] = useState<string>("todos");

  const q = useQuery({
    queryKey: ["metricas", organizationId, dias],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId!, dias } }),
  });

  const bruto = q.data as
    | { posts: PostBruto[]; leituras: Leitura[]; baselines: Baseline[]; houveColeta: boolean }
    | undefined;

  const dados = useMemo(() => {
    const posts = (bruto?.posts ?? []).filter(
      (p) =>
        (conta === "todas" || p.source_handle === conta) &&
        (pilar === "todos" || p.pillar_id === pilar),
    );
    const idsFiltrados = new Set(posts.map((p) => p.id));
    const leituras = (bruto?.leituras ?? []).filter((l) => idsFiltrados.has(l.post_id));
    const linhas = montarLinhas(posts, leituras, bruto?.baselines ?? []);

    return {
      linhas,
      kpis: calcularKpis(linhas),
      serie: serieDiaria(linhas, dias),
      formatos: distribuicaoFormatos(linhas),
      ultimaColeta: ultimaColeta(bruto?.leituras ?? []),
      houveColeta: bruto?.houveColeta ?? false,
    };
  }, [bruto, conta, pilar, dias]);

  return {
    ...dados,
    dias,
    setDias,
    conta,
    setConta,
    pilar,
    setPilar,
    carregando: q.isPending,
    atualizando: q.isFetching,
    atualizar: () => q.refetch(),
  };
}

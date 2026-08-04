import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { carregarMetricas, listarContasConectadas } from "@/lib/metricas.functions";
import {
  calcularKpis,
  distribuicaoFormatos,
  intervaloAnterior,
  intervaloAtual,
  montarLinhas,
  serieDiaria,
  ultimaColeta,
  type Baseline,
  type Intervalo,
  type Leitura,
  type PostBruto,
} from "@/lib/metricas";

export type Periodo = 7 | 30 | 90;
export type ModoComparacao = "off" | "anterior" | "custom";

type Bruto = {
  posts: PostBruto[];
  leituras: Leitura[];
  baselines: Baseline[];
  houveColeta: boolean;
};

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

function soData(iso: string) {
  return iso.slice(0, 10);
}

export function useMetricas(diasInicial: Periodo = 30) {
  const { organizationId } = useOrg();
  const buscar = useServerFn(carregarMetricas);

  const [dias, setDias] = useState<Periodo>(diasInicial);

  const [conta, setConta] = useState<string>("todas");
  const [pilar, setPilar] = useState<string>("todos");
  const [comparacao, setComparacao] = useState<ModoComparacao>("off");
  const [customDesde, setCustomDesde] = useState<string>(() =>
    soData(intervaloAnterior(30).desde),
  );
  const [customAte, setCustomAte] = useState<string>(() => soData(intervaloAnterior(30).ate));

  const intervalo = useMemo(() => intervaloAtual(dias), [dias]);

  const intervaloComparado: Intervalo | null = useMemo(() => {
    if (comparacao === "off") return null;
    if (comparacao === "anterior") return intervaloAnterior(dias);
    if (!customDesde || !customAte) return null;
    return {
      desde: new Date(`${customDesde}T00:00:00`).toISOString(),
      ate: new Date(`${customAte}T23:59:59`).toISOString(),
    };
  }, [comparacao, dias, customDesde, customAte]);

  const q = useQuery({
    queryKey: ["metricas", organizationId, dias],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId!, dias } }),
  });

  const qc = useQuery({
    queryKey: ["metricas", organizationId, dias, intervaloComparado?.desde, intervaloComparado?.ate],
    enabled: !!organizationId && !!intervaloComparado,
    queryFn: () =>
      buscar({
        data: {
          organizationId: organizationId!,
          dias,
          desde: intervaloComparado!.desde,
          ate: intervaloComparado!.ate,
        },
      }),
  });

  const bruto = q.data as Bruto | undefined;
  const brutoComparado = qc.data as Bruto | undefined;

  const filtrar = useMemo(
    () => (base: Bruto | undefined) => {
      const posts = (base?.posts ?? []).filter(
        (p) =>
          (conta === "todas" || p.source_handle === conta) &&
          (pilar === "todos" || p.pillar_id === pilar),
      );
      const ids = new Set(posts.map((p) => p.id));
      const leituras = (base?.leituras ?? []).filter((l) => ids.has(l.post_id));
      return montarLinhas(posts, leituras, base?.baselines ?? []);
    },
    [conta, pilar],
  );

  const dados = useMemo(() => {
    const linhas = filtrar(bruto);
    return {
      linhas,
      kpis: calcularKpis(linhas),
      serie: serieDiaria(linhas, dias),
      formatos: distribuicaoFormatos(linhas),
      ultimaColeta: ultimaColeta(bruto?.leituras ?? []),
      houveColeta: bruto?.houveColeta ?? false,
    };
  }, [bruto, filtrar, dias]);

  const kpisComparados = useMemo(() => {
    if (!intervaloComparado || !brutoComparado) return null;
    return calcularKpis(filtrar(brutoComparado));
  }, [intervaloComparado, brutoComparado, filtrar]);

  return {
    ...dados,
    dias,
    setDias,
    conta,
    setConta,
    pilar,
    setPilar,
    comparacao,
    setComparacao,
    customDesde,
    setCustomDesde,
    customAte,
    setCustomAte,
    intervalo,
    intervaloComparado,
    kpisComparados,
    comparando: qc.isFetching,
    carregando: q.isPending,
    atualizando: q.isFetching || qc.isFetching,
    atualizar: () => {
      void q.refetch();
      if (intervaloComparado) void qc.refetch();
    },
  };
}

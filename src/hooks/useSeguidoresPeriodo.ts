import { useQuery } from "@tanstack/react-query";

import { useFollowers } from "@/hooks/useFollowers";
import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import type { Intervalo } from "@/lib/metricas";

export type SerieSeguidores = { dia: string; valor: number }[];

export type SeguidoresPeriodo = {
  /** série diária somada das contas do recorte */
  serie: SerieSeguidores;
  /** ganho no período (último − primeiro dia com leitura); null = base insuficiente */
  delta: number | null;
  /** primeiro dia com histórico dentro do período */
  primeiroDia: string | null;
  /** quantidade de dias distintos com snapshot */
  dias: number;
};

const VAZIO: SeguidoresPeriodo = { serie: [], delta: null, primeiroDia: null, dias: 0 };

function soData(iso: string) {
  return iso.slice(0, 10);
}

function agregar(series: SerieSeguidores[]): SeguidoresPeriodo {
  const porDia = new Map<string, number>();
  for (const s of series) {
    for (const p of s) porDia.set(p.dia, (porDia.get(p.dia) ?? 0) + p.valor);
  }
  const serie = [...porDia.entries()]
    .map(([dia, valor]) => ({ dia, valor }))
    .sort((a, b) => a.dia.localeCompare(b.dia));

  if (!serie.length) return VAZIO;

  const primeiro = serie[0]!;
  const ultimo = serie[serie.length - 1]!;

  return {
    serie,
    delta: serie.length >= 2 ? ultimo.valor - primeiro.valor : null,
    primeiroDia: primeiro.dia,
    dias: serie.length,
  };
}

async function buscarSerie(
  organizationId: string,
  handle: string,
  intervalo: Intervalo,
): Promise<SerieSeguidores> {
  const { data, error } = await supabase.rpc("metric_daily", {
    p_org: organizationId,
    p_handle: handle,
    p_metric: "followers",
    p_from: soData(intervalo.desde),
    p_to: soData(intervalo.ate),
  });
  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[])
    .map((l) => ({ dia: String(l["d"] ?? "").slice(0, 10), valor: Number(l["valor"] ?? 0) }))
    .filter((p) => p.dia && Number.isFinite(p.valor));
}

/**
 * Novos seguidores dentro de um intervalo, somando as contas do recorte.
 * Lê o histórico já existente via RPC `metric_daily` (métrica `followers`).
 */
export function useSeguidoresPeriodo(intervalo: Intervalo | null, conta: string) {
  const { organizationId } = useOrg();
  const { data: resumo, isPending: carregandoContas } = useFollowers();

  const handles = (resumo?.contas ?? [])
    .map((c) => c.handle)
    .filter((h) => h && (conta === "todas" || h === conta.replace(/^@/, "")))
    .sort();

  const q = useQuery<SeguidoresPeriodo>({
    queryKey: ["seguidores-periodo", organizationId, handles.join(","), intervalo?.desde, intervalo?.ate],
    enabled: !!organizationId && !!intervalo && handles.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const series = await Promise.all(
        handles.map((h) => buscarSerie(organizationId!, h, intervalo!)),
      );
      return agregar(series);
    },
  });

  return {
    dados: q.data ?? VAZIO,
    carregando: carregandoContas || q.isPending,
    semContas: !carregandoContas && handles.length === 0,
  };
}

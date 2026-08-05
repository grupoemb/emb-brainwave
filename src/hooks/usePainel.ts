import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { carregarPainel } from "@/lib/painel.functions";

export type DiasPainel = 7 | 14 | 30 | 90;
/** @deprecated use DiasPainel */
export type DiasOutliers = DiasPainel;

export function usePainel(dias: DiasPainel = 7) {
  const { organizationId } = useOrg();
  const buscar = useServerFn(carregarPainel);

  const q = useQuery({
    queryKey: ["painel", organizationId, dias],
    enabled: !!organizationId,
    placeholderData: keepPreviousData,
    queryFn: () => buscar({ data: { organizationId: organizationId!, dias } }),
  });

  return {
    dados: q.data ?? null,
    carregando: q.isPending || !organizationId,
    recalculando: q.isFetching && !q.isPending,
  };
}

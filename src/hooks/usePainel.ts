import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { carregarPainel } from "@/lib/painel.functions";

export type DiasOutliers = 7 | 14 | 30;

export function usePainel(diasOutliers: DiasOutliers = 7) {
  const { organizationId } = useOrg();
  const buscar = useServerFn(carregarPainel);

  const q = useQuery({
    queryKey: ["painel", organizationId, diasOutliers],
    enabled: !!organizationId,
    placeholderData: keepPreviousData,
    queryFn: () => buscar({ data: { organizationId: organizationId!, diasOutliers } }),
  });

  return {
    dados: q.data ?? null,
    carregando: q.isPending || !organizationId,
    recalculando: q.isFetching && !q.isPending,
  };
}

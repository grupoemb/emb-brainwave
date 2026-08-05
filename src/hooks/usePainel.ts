import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { carregarPainel } from "@/lib/painel.functions";

export type DiasPainel = 7 | 14 | 30 | 90;
/** @deprecated use DiasPainel */
export type DiasOutliers = DiasPainel;

export function usePainel(dias: DiasPainel = 7, handle?: string | null) {
  const { organizationId } = useOrg();
  const buscar = useServerFn(carregarPainel);
  const perfil = handle?.trim() ? handle.trim() : null;

  const q = useQuery({
    queryKey: ["painel", organizationId, dias, perfil],
    enabled: !!organizationId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      buscar({
        data: {
          organizationId: organizationId!,
          dias,
          ...(perfil ? { handle: perfil } : {}),
        },
      }),
  });

  return {
    dados: q.data ?? null,
    carregando: q.isPending || !organizationId,
    recalculando: q.isFetching && !q.isPending,
  };
}

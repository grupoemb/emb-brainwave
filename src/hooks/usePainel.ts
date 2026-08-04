import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { carregarPainel } from "@/lib/painel.functions";

export function usePainel() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(carregarPainel);

  const q = useQuery({
    queryKey: ["painel", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  return { dados: q.data ?? null, carregando: q.isPending || !organizationId };
}

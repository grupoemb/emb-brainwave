import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { obterMinhaOrganizacao } from "@/lib/conteudo.functions";

export function useOrg() {
  const buscar = useServerFn(obterMinhaOrganizacao);
  const { data, isPending } = useQuery({
    queryKey: ["minha-organizacao"],
    queryFn: () => buscar(),
    staleTime: 5 * 60_000,
  });

  const papel = data?.papel ?? null;

  return {
    organizationId: data?.organizationId ?? null,
    papel,
    canReview: ["owner", "admin", "editor", "reviewer"].includes(papel ?? ""),
    carregando: isPending,
  };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { useOrg } from "@/hooks/useOrg";
import {
  alternarContaAtiva,
  definirPapelMembro,
  listarContasSociais,
  listarMembros,
  listarPilaresCompletos,
  listarTemplates,
  obterMarca,
  removerMembro,
  removerPilar,
  salvarMarca,
  salvarPilar,
  salvarTemplate,
} from "@/lib/ajustes.functions";

export function mensagemErro(erro: unknown) {
  const texto = erro instanceof Error ? erro.message : "";
  if (/row-level security|permission|violates|policy/i.test(texto)) {
    return "Você não tem permissão para esta ação";
  }
  return texto || "Não foi possível concluir a ação";
}

function useOrgId() {
  const { organizationId } = useOrg();
  return organizationId;
}

/* ------------------------------- EQUIPE ------------------------------- */

export function useEquipe() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const buscar = useServerFn(listarMembros);
  const definirPapel = useServerFn(definirPapelMembro);
  const remover = useServerFn(removerMembro);

  const q = useQuery({
    queryKey: ["equipe", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: ["equipe", organizationId] });

  const mudarPapel = useMutation({
    mutationFn: (v: { userId: string; papel: Parameters<typeof definirPapel>[0]["data"]["papel"] }) =>
      definirPapel({ data: { organizationId: organizationId!, ...v } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Papel atualizado");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  const excluir = useMutation({
    mutationFn: (userId: string) => remover({ data: { organizationId: organizationId!, userId } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Membro removido");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  return { membros: q.data ?? [], carregando: q.isPending, mudarPapel, excluir };
}

/* -------------------------------- CONTAS ------------------------------- */

export function useContasSociais() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const buscar = useServerFn(listarContasSociais);
  const alternar = useServerFn(alternarContaAtiva);

  const q = useQuery({
    queryKey: ["contas-sociais", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const alternarAtiva = useMutation({
    mutationFn: (v: { id: string; ativa: boolean }) => alternar({ data: v }),
    onSuccess: async (_r, v) => {
      await qc.invalidateQueries({ queryKey: ["contas-sociais", organizationId] });
      toast.success(v.ativa ? "Conta ativada" : "Conta desativada");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  return { contas: q.data ?? [], carregando: q.isPending, alternarAtiva };
}

/* ---------------------------- MARCA & PILARES --------------------------- */

export function useMarca() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const buscar = useServerFn(obterMarca);
  const salvar = useServerFn(salvarMarca);

  const q = useQuery({
    queryKey: ["marca", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const gravar = useMutation({
    mutationFn: (v: {
      id: string | null;
      name: string;
      voice: string;
      audience: string;
      guidelines: string;
    }) => salvar({ data: { organizationId: organizationId!, ...v } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["marca", organizationId] });
      toast.success("Marca atualizada");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  return { marca: q.data ?? null, carregando: q.isPending, gravar };
}

export function usePilaresCompletos() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const buscar = useServerFn(listarPilaresCompletos);
  const salvar = useServerFn(salvarPilar);
  const remover = useServerFn(removerPilar);

  const q = useQuery({
    queryKey: ["pilares-completos", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const invalidar = async () => {
    await qc.invalidateQueries({ queryKey: ["pilares-completos", organizationId] });
    await qc.invalidateQueries({ queryKey: ["pilares"] });
  };

  const gravar = useMutation({
    mutationFn: (v: { id: string | null; name: string; description: string; color: string }) =>
      salvar({ data: { organizationId: organizationId!, ...v } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Pilar salvo");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => remover({ data: { id } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Pilar removido");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  return { pilares: q.data ?? [], carregando: q.isPending, gravar, excluir };
}

/* ----------------------------- TEMPLATES IA ----------------------------- */

export function useTemplates() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const buscar = useServerFn(listarTemplates);
  const salvar = useServerFn(salvarTemplate);

  const q = useQuery({
    queryKey: ["templates-ia", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  const gravar = useMutation({
    mutationFn: (v: {
      id: string;
      system_prompt: string;
      is_active: boolean;
      version: number;
    }) => salvar({ data: v }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["templates-ia", organizationId] });
      toast.success("Template salvo");
    },
    onError: (e) => toast.error(mensagemErro(e)),
  });

  return { templates: q.data ?? [], carregando: q.isPending, gravar };
}

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import {
  aceitarSugestao,
  descartarSugestao,
  listarSugestoes,
  obterCerebro,
  type Sugestao,
} from "@/lib/inteligencia.functions";

export type FiltroPauta = "new" | "accepted" | "dismissed";

/** Normaliza texto para busca: minúsculo e sem acento. */
function normalizar(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function casaTexto(s: Sugestao, termo: string) {
  if (!termo) return true;
  const alvo = normalizar(`${s.title} ${s.rationale ?? ""}`);
  return termo.split(/\s+/).every((p) => alvo.includes(p));
}

export function usePautas() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const buscar = useServerFn(listarSugestoes);
  const aceitarFn = useServerFn(aceitarSugestao);
  const descartarFn = useServerFn(descartarSugestao);

  const filtros = useSearch({ from: "/_authenticated/pautas" });
  const navigate = useNavigate({ from: "/pautas" });

  const definir = (p: Partial<typeof filtros>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });
  const limpar = () =>
    navigate({
      search: (prev) => ({ ...prev, q: "", tipo: "todos", pilar: "todos" }),
      replace: true,
    });

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

  const todas = useMemo(() => q.data?.sugestoes ?? [], [q.data]);
  const termo = normalizar(filtros.q);

  const derivado = useMemo(() => {
    const casaTipo = (s: Sugestao) => filtros.tipo === "todos" || s.kind === filtros.tipo;
    const casaPilar = (s: Sugestao) => filtros.pilar === "todos" || s.pillar_id === filtros.pilar;
    const casaStatus = (s: Sugestao) => s.status === filtros.status;

    const lista = todas.filter(
      (s) => casaStatus(s) && casaTipo(s) && casaPilar(s) && casaTexto(s, termo),
    );

    const contagemStatus: Record<string, number> = { new: 0, accepted: 0, dismissed: 0 };
    for (const s of todas) {
      if (casaTipo(s) && casaPilar(s) && casaTexto(s, termo)) {
        contagemStatus[s.status] = (contagemStatus[s.status] ?? 0) + 1;
      }
    }

    const contagemTipo: Record<string, number> = {};
    for (const s of todas) {
      if (!casaStatus(s) || !casaPilar(s) || !casaTexto(s, termo)) continue;
      contagemTipo["todos"] = (contagemTipo["todos"] ?? 0) + 1;
      contagemTipo[s.kind] = (contagemTipo[s.kind] ?? 0) + 1;
    }

    const mapaPilares = new Map<string, { id: string; nome: string; cor: string | null }>();
    for (const s of todas) {
      if (s.pillar_id && s.pilar_nome && !mapaPilares.has(s.pillar_id)) {
        mapaPilares.set(s.pillar_id, {
          id: s.pillar_id,
          nome: s.pilar_nome,
          cor: s.pilar_cor,
        });
      }
    }

    return { lista, contagemStatus, contagemTipo, pilares: [...mapaPilares.values()] };
  }, [todas, filtros.status, filtros.tipo, filtros.pilar, termo]);

  const ultimaRodada = q.data?.ultimaRodada ? new Date(q.data.ultimaRodada).getTime() : null;

  return {
    ...derivado,
    filtros,
    definir,
    limpar,
    temFiltroExtra: !!filtros.q || filtros.tipo !== "todos" || filtros.pilar !== "todos",
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

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import {
  aceitarSugestao,
  audienciaDoPost,
  resumoAudiencia,
  descartarSugestao,
  listarSugestoes,
  obterCerebro,
  type Sugestao,
} from "@/lib/inteligencia.functions";

export type FiltroPauta = "new" | "accepted" | "dismissed";

export type EstadoFiltros = { q: string; status: string; tipo: string; pilar: string };

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

  const filtros: EstadoFiltros = useSearch({ from: "/_authenticated/pautas" });
  const navigate = useNavigate();

  const definir = (p: Partial<EstadoFiltros>) =>
    navigate({
      to: "/pautas",
      search: (prev: Partial<EstadoFiltros>) => ({ q: "", status: "new", tipo: "todos", pilar: "todos", ...prev, ...p }),
      replace: true,
    });
  const limpar = () =>
    navigate({
      to: "/pautas",
      search: (prev: Partial<EstadoFiltros>) => ({ status: "new", ...prev, q: "", tipo: "todos", pilar: "todos" }),
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

  const gerar = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("suggest", {
        body: { organization_id: organizationId!, force: true },
      });
      if (error) throw new Error(error.message || "Não foi possível gerar pautas agora.");
      return data as unknown;
    },
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
    gerar,
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

export function useAudienciaOrg() {
  const { organizationId } = useOrg();
  const buscar = useServerFn(resumoAudiencia);

  const q = useQuery({
    queryKey: ["audiencia-org", organizationId],
    enabled: !!organizationId,
    queryFn: () => buscar({ data: { organizationId: organizationId! } }),
  });

  return {
    carregando: q.isPending,
    perguntas: q.data?.perguntas ?? [],
    temas: q.data?.temas ?? [],
    notas: q.data?.notas ?? 0,
  };
}

export function useAudienciaPost(postId: string) {
  const buscar = useServerFn(audienciaDoPost);

  const q = useQuery({
    queryKey: ["audiencia-post", postId],
    enabled: !!postId,
    queryFn: () => buscar({ data: { postId } }),
  });

  return { carregando: q.isPending, nota: q.data ?? null };
}

/* ─────────────── Inteligência do Painel (RPCs + alertas) ─────────────── */

export type TaxasPainel = {
  taxas: Record<string, number | null>;
  conteudo: Record<string, number | null>;
};

export type JanelaHorario = {
  dia: string | null;
  faixa: string | null;
  rx_medio: number | null;
  alcance_medio: number | null;
};

export type AlertaPainel = {
  id: string;
  kind: string;
  severity: string;
  title: string;
  body: string | null;
  handle: string | null;
  seen: boolean;
  created_at: string;
};

function comoObjeto(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function comoNumero(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function normalizarNumeros(v: unknown): Record<string, number | null> {
  const fonte = comoObjeto(v);
  const saida: Record<string, number | null> = {};
  for (const [k, valor] of Object.entries(fonte)) saida[k] = comoNumero(valor);
  return saida;
}

/** Taxas do período (ERR, save/share/reach rate) e indicadores de conteúdo. */
export function useTaxasPainel(dias: number, handle: string | null) {
  const { organizationId } = useOrg();

  return useQuery<TaxasPainel>({
    queryKey: ["painel-taxas", organizationId, dias, handle],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("kpis_taxas", {
        p_org: organizationId!,
        ...(handle ? { p_handle: handle } : {}),
        p_dias: dias,
      });
      if (error) throw new Error(error.message);
      const raiz = comoObjeto(data);
      return {
        taxas: normalizarNumeros(raiz["taxas"]),
        conteudo: normalizarNumeros(raiz["conteudo"]),
      };
    },
  });
}

/** Melhores janelas de publicação segundo o histórico da organização. */
export function useMelhorHorario(handle: string | null) {
  const { organizationId } = useOrg();

  return useQuery<JanelaHorario[]>({
    queryKey: ["painel-horario", organizationId, handle],
    enabled: !!organizationId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("best_time_recommendation", {
        p_org: organizationId!,
        ...(handle ? { p_handle: handle } : {}),
      });
      if (error) throw new Error(error.message);
      const lista = comoObjeto(data)["melhores"];
      if (!Array.isArray(lista)) return [];
      return lista.map((item) => {
        const o = comoObjeto(item);
        return {
          dia: typeof o["dia"] === "string" ? o["dia"] : null,
          faixa: typeof o["faixa"] === "string" ? o["faixa"] : String(o["faixa"] ?? "") || null,
          rx_medio: comoNumero(o["rx_medio"]),
          alcance_medio: comoNumero(o["alcance_medio"]),
        };
      });
    },
  });
}

/** Últimos alertas da organização + ação de marcar como visto. */
export function useAlertas() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const chave = ["painel-alertas", organizationId];

  const q = useQuery<AlertaPainel[]>({
    queryKey: chave,
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw new Error(error.message);
      return (data ?? []) as AlertaPainel[];
    },
  });

  const marcarVisto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ seen: true }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: chave });
      const antes = qc.getQueryData<AlertaPainel[]>(chave);
      qc.setQueryData<AlertaPainel[]>(chave, (lista) =>
        (lista ?? []).map((a) => (a.id === id ? { ...a, seen: true } : a)),
      );
      return { antes };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.antes) qc.setQueryData(chave, ctx.antes);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chave }),
  });

  const alertas = q.data ?? [];

  return {
    alertas,
    naoVistos: alertas.filter((a) => !a.seen).length,
    carregando: q.isPending,
    erro: q.error instanceof Error ? q.error.message : null,
    marcarVisto,
  };
}


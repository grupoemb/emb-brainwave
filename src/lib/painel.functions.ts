import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  agregarPainel,
  ultimaPorPost,
  type BaselineBruta,
  type LeituraBruta,
  type PostBrutoPainel,
} from "@/lib/painel.calculo";
import type { DadosPainel, KpisPainel } from "@/lib/painel.tipos";

export type {
  AgendadoPainel,
  ContaPainel,
  DadosPainel,
  DestaquesPainel,
  InsightPainel,
  KpisPainel,
  MelhorPost,
  MixFormato,
  OutlierPainel,
  PautaPainel,
  PontoSerie,
} from "@/lib/painel.tipos";

export const carregarPainel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        organizationId: z.string().uuid(),
        dias: z.union([z.literal(7), z.literal(14), z.literal(30), z.literal(90)]).optional(),
        handle: z.string().optional(),
      })
      .parse(input),
  )

  .handler(async ({ data, context }): Promise<DadosPainel> => {
    const db = context.supabase as unknown as SupabaseClient;
    const org = data.organizationId;
    const dias = data.dias ?? 7;
    const agora = new Date();
    const em7d = new Date(agora.getTime() + 7 * 86_400_000).toISOString();
    const haJanela = new Date(agora.getTime() - dias * 86_400_000).toISOString();
    const haJanelaAnterior = new Date(agora.getTime() - 2 * dias * 86_400_000).toISOString();
    const ha30d = new Date(agora.getTime() - 30 * 86_400_000).toISOString();

    const colunasMetricas =
      "post_id, reach, impressions, likes, comments, saves, shares, retention_pct, followers_delta, captured_at";

    const [
      perfilRes,
      agendadosRes,
      todosRes,
      publicadosRes,
      anterioresRes,
      sugestoesRes,
      insightsRes,
      contasRes,
      baseRes,
      audienciaRes,
    ] = await Promise.all([
      db.from("profiles").select("full_name").eq("id", context.userId).maybeSingle(),
      db
        .from("posts")
        .select("id, title, channel, scheduled_for")
        .eq("organization_id", org)
        .eq("status", "scheduled")
        .gte("scheduled_for", agora.toISOString())
        .lte("scheduled_for", em7d)
        .order("scheduled_for", { ascending: true }),
      db.from("posts").select("id, status").eq("organization_id", org),
      db
        .from("posts")
        .select("id, title, channel, format, meta, published_at")
        .eq("organization_id", org)
        .eq("status", "published")
        .gte("published_at", haJanela),
      db
        .from("posts")
        .select("id, title, channel, format, meta, published_at")
        .eq("organization_id", org)
        .eq("status", "published")
        .gte("published_at", haJanelaAnterior)
        .lt("published_at", haJanela),
      db
        .from("suggestions")
        .select("id, title, rationale, priority, status")
        .eq("organization_id", org)
        .eq("status", "new")
        .order("priority", { ascending: false }),
      db
        .from("insights")
        .select("id, statement, strength")
        .eq("organization_id", org)
        .eq("status", "active")
        .order("strength", { ascending: false })
        .limit(3),
      db
        .from("social_accounts")
        .select("handle, channel, meta, connected_at")
        .eq("organization_id", org),
      db
        .from("metric_baselines")
        .select("channel, format, metric, median_value")
        .eq("organization_id", org)
        .eq("metric", "reach"),
      db
        .from("audience_notes")
        .select("themes, questions")
        .eq("organization_id", org)
        .gte("analyzed_at", ha30d),
    ]);

    const agendadosBrutos = (agendadosRes.data ?? []) as {
      id: string;
      title: string;
      channel: string | null;
      scheduled_for: string;
    }[];

    const aprovados = new Set<string>();
    if (agendadosBrutos.length) {
      const { data: aprovacoes } = await db
        .from("approvals")
        .select("post_id, decision")
        .in(
          "post_id",
          agendadosBrutos.map((p) => p.id),
        );
      for (const a of (aprovacoes ?? []) as { post_id: string; decision: string }[]) {
        if (["approved", "approve", "aprovado", "ok", "yes"].includes(a.decision.toLowerCase())) {
          aprovados.add(a.post_id);
        }
      }
    }

    const handleFiltro = data.handle?.trim() ? data.handle.trim() : null;
    const doPerfil = (p: PostBrutoPainel) => {
      const bruto = p.meta?.["source_handle"];
      return typeof bruto === "string" && bruto === handleFiltro;
    };

    const publicadosTodos = (publicadosRes.data ?? []) as PostBrutoPainel[];
    const anterioresTodos = (anterioresRes.data ?? []) as PostBrutoPainel[];
    const publicados = handleFiltro ? publicadosTodos.filter(doPerfil) : publicadosTodos;
    const anteriores = handleFiltro ? anterioresTodos.filter(doPerfil) : anterioresTodos;
    const baselines = (baseRes.data ?? []) as BaselineBruta[];

    const contasBrutas = (contasRes.data ?? []) as {
      handle: string;
      channel: string | null;
      meta: Record<string, unknown> | null;
      connected_at: string | null;
    }[];

    const avatarDe = (meta: Record<string, unknown> | null) => {
      const url = meta?.["avatar_url"];
      return typeof url === "string" && url ? url : null;
    };

    /** Lista completa e estável de perfis — nunca sofre o filtro. */
    const perfis = contasBrutas
      .map((c) => ({ handle: c.handle, avatarUrl: avatarDe(c.meta) }))
      .sort((a, b) => a.handle.localeCompare(b.handle));

    const contasInfo = new Map<string, { channel: string | null; avatarUrl: string | null }>();
    for (const c of contasBrutas) {
      if (handleFiltro && c.handle !== handleFiltro) continue;
      contasInfo.set(c.handle, { channel: c.channel, avatarUrl: avatarDe(c.meta) });
    }


    const [leiturasRes, leiturasAntRes] = await Promise.all([
      publicados.length
        ? db
            .from("post_metrics")
            .select(colunasMetricas)
            .in(
              "post_id",
              publicados.map((p) => p.id),
            )
            .order("captured_at", { ascending: false })
        : Promise.resolve({ data: [] as LeituraBruta[] }),
      anteriores.length
        ? db
            .from("post_metrics")
            .select(colunasMetricas)
            .in(
              "post_id",
              anteriores.map((p) => p.id),
            )
            .order("captured_at", { ascending: false })
        : Promise.resolve({ data: [] as LeituraBruta[] }),
    ]);

    const leiturasArr = (leiturasRes.data ?? []) as LeituraBruta[];
    const leituras = ultimaPorPost(leiturasArr);
    const leiturasAnt = ultimaPorPost((leiturasAntRes.data ?? []) as LeituraBruta[]);

    let ultimaColeta: string | null = null;
    for (const l of leiturasArr) {
      if (!ultimaColeta || l.captured_at > ultimaColeta) ultimaColeta = l.captured_at;
    }

    const alcanceAnteriorPorConta = new Map<string, number>();
    for (const p of anteriores) {
      const bruto = p.meta?.["source_handle"];
      const conta = typeof bruto === "string" && bruto ? bruto : "sem conta";
      const reach = leiturasAnt.get(p.id)?.reach ?? 0;
      alcanceAnteriorPorConta.set(conta, (alcanceAnteriorPorConta.get(conta) ?? 0) + (reach ?? 0));
    }

    const atual = agregarPainel(
      publicados,
      leituras,
      baselines,
      dias,
      alcanceAnteriorPorConta,
      contasInfo,
    );
    const anteriorAgregado = anteriores.length
      ? agregarPainel(anteriores, leiturasAnt, baselines, dias, new Map(), contasInfo)
      : null;
    const anterior: KpisPainel | null = anteriorAgregado ? anteriorAgregado.kpis : null;

    const producao: Record<string, number> = {};
    for (const p of (todosRes.data ?? []) as { status: string }[]) {
      producao[p.status] = (producao[p.status] ?? 0) + 1;
    }

    const sugestoes = (sugestoesRes.data ?? []) as {
      id: string;
      title: string;
      rationale: string | null;
      priority: number | null;
    }[];

    const contagem = (campo: "themes" | "questions") => {
      const mapa = new Map<string, number>();
      for (const n of (audienciaRes.data ?? []) as Record<string, unknown>[]) {
        const lista = n[campo];
        if (!Array.isArray(lista)) continue;
        for (const item of lista) {
          if (typeof item !== "string" || !item.trim()) continue;
          const chave = item.trim();
          mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
        }
      }
      return [...mapa.entries()]
        .map(([texto, n]) => ({ texto, n }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 3);
    };

    const perfil = perfilRes.data as { full_name: string | null } | null;

    return {
      nome: perfil?.full_name ?? null,
      ultimaColeta,
      dias,
      kpis: atual.kpis,
      anterior,
      operacao: {
        agendados: agendadosBrutos.length,
        aguardandoAprovacao: producao["review"] ?? 0,
        pautasNovas: sugestoes.length,
        contasConectadas: contasBrutas.filter((c) => !!c.connected_at).length,
      },
      agendados: agendadosBrutos.map((p) => ({
        id: p.id,
        title: p.title,
        channel: p.channel,
        scheduled_for: p.scheduled_for,
        aprovado: aprovados.has(p.id),
      })),
      pautas: sugestoes.slice(0, 3).map((s) => ({
        id: s.id,
        title: s.title,
        rationale: s.rationale,
        priority: Number(s.priority ?? 0),
      })),
      insights: (
        (insightsRes.data ?? []) as { id: string; statement: string; strength: number | null }[]
      ).map((i) => ({ id: i.id, statement: i.statement, strength: Number(i.strength ?? 0) })),
      outliers: atual.outliers.slice(0, 6),
      contas: atual.contas,
      destaques: atual.destaques,
      producao,
      serie: atual.serie,
      mixFormatos: atual.mixFormatos,
      calor: atual.calor,
      audiencia: { temas: contagem("themes"), perguntas: contagem("questions") },
    };
  });

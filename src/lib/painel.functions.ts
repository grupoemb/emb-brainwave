import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AgendadoPainel = {
  id: string;
  title: string;
  channel: string | null;
  scheduled_for: string;
  aprovado: boolean;
};

export type PautaPainel = {
  id: string;
  title: string;
  rationale: string | null;
  priority: number;
};

export type InsightPainel = {
  id: string;
  statement: string;
  strength: number;
};

export type OutlierPainel = {
  id: string;
  title: string;
  conta: string | null;
  rx: number;
};

export type MelhorPost = {
  id: string;
  title: string;
  conta: string | null;
  alcance: number | null;
  rx: number | null;
  engajamento: number | null;
};

export type ContaPainel = {
  conta: string;
  channel: string | null;
  posts: number;
  alcance: number | null;
  alcanceMedio: number | null;
  engajamento: number | null;
  rxMedio: number | null;
  outliers: number;
  consistencia: number | null;
  variacaoAlcance: number | null;
  melhorPost: MelhorPost | null;
};

export type DestaquesPainel = {
  melhorAlcance: MelhorPost | null;
  melhorEngajamento: MelhorPost | null;
  maiorRx: MelhorPost | null;
  contaConsistente: { conta: string; consistencia: number } | null;
};

export type DadosPainel = {
  nome: string | null;
  ultimaColeta: string | null;
  kpis: {
    agendados: number;
    aguardandoAprovacao: number;
    pautasNovas: number;
    alcance7d: number | null;
    contasConectadas: number;
  };
  agendados: AgendadoPainel[];
  pautas: PautaPainel[];
  insights: InsightPainel[];
  outliers: OutlierPainel[];
  contas: ContaPainel[];
  destaques: DestaquesPainel;
  producao: Record<string, number>;
};


export const carregarPainel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        organizationId: z.string().uuid(),
        diasOutliers: z.union([z.literal(7), z.literal(14), z.literal(30)]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<DadosPainel> => {
    const db = context.supabase as unknown as SupabaseClient;
    const org = data.organizationId;
    const dias = data.diasOutliers ?? 7;
    const agora = new Date();
    const em7d = new Date(agora.getTime() + 7 * 86_400_000).toISOString();
    const ha7d = new Date(agora.getTime() - 7 * 86_400_000).toISOString();
    const haJanela = new Date(agora.getTime() - dias * 86_400_000).toISOString();

    const [perfilRes, agendadosRes, todosRes, publicadosRes, sugestoesRes, insightsRes, contasRes] =
      await Promise.all([
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
          .select("id")
          .eq("organization_id", org)
          .not("connected_at", "is", null),
      ]);

    const agendadosBrutos = (agendadosRes.data ?? []) as {
      id: string;
      title: string;
      channel: string | null;
      scheduled_for: string;
    }[];

    // Aprovações positivas dos posts agendados.
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

    // Alcance dos últimos 7 dias: última leitura por post publicado no período.
    const publicados = (publicadosRes.data ?? []) as {
      id: string;
      title: string;
      channel: string | null;
      format: string | null;
      meta: Record<string, unknown> | null;
      published_at: string | null;
    }[];
    const idsPublicados = publicados.map((p) => p.id);
    let alcance7d: number | null = null;
    let ultimaColeta: string | null = null;
    const outliers: OutlierPainel[] = [];
    const contas: ContaPainel[] = [];
    const destaques: DestaquesPainel = {
      melhorAlcance: null,
      melhorEngajamento: null,
      maiorRx: null,
      contaConsistente: null,
    };

    if (idsPublicados.length) {
      const haJanelaAnterior = new Date(agora.getTime() - 2 * dias * 86_400_000).toISOString();

      const [{ data: leituras }, { data: baseRaw }, { data: anterioresRaw }] = await Promise.all([
        db
          .from("post_metrics")
          .select("post_id, reach, likes, comments, saves, shares, captured_at")
          .in("post_id", idsPublicados)
          .order("captured_at", { ascending: false }),
        db
          .from("metric_baselines")
          .select("channel, format, metric, median_value")
          .eq("organization_id", org)
          .eq("metric", "reach"),
        db
          .from("posts")
          .select("id, meta")
          .eq("organization_id", org)
          .eq("status", "published")
          .gte("published_at", haJanelaAnterior)
          .lt("published_at", haJanela),
      ]);

      type LeituraBruta = {
        post_id: string;
        reach: number | null;
        likes: number | null;
        comments: number | null;
        saves: number | null;
        shares: number | null;
        captured_at: string;
      };

      const vistos = new Map<string, LeituraBruta>();
      for (const l of (leituras ?? []) as LeituraBruta[]) {
        if (!vistos.has(l.post_id)) vistos.set(l.post_id, l);
        if (!ultimaColeta || l.captured_at > ultimaColeta) ultimaColeta = l.captured_at;
      }
      // O KPI de alcance continua fixo em 7 dias, mesmo com janela maior de outliers.
      const de7d = publicados.filter((p) => (p.published_at ?? "") >= ha7d && vistos.has(p.id));
      const soma = de7d.reduce<number>((t, p) => t + (vistos.get(p.id)?.reach ?? 0), 0);
      alcance7d = de7d.length ? soma : null;

      const baselines = (baseRaw ?? []) as {
        channel: string;
        format: string;
        median_value: number | null;
      }[];

      // Alcance da janela anterior, por conta (para a variação).
      const anteriores = (anterioresRaw ?? []) as {
        id: string;
        meta: Record<string, unknown> | null;
      }[];
      const alcanceAnterior = new Map<string, number>();
      if (anteriores.length) {
        const { data: leiturasAnt } = await db
          .from("post_metrics")
          .select("post_id, reach, captured_at")
          .in(
            "post_id",
            anteriores.map((p) => p.id),
          )
          .order("captured_at", { ascending: false });
        const vistosAnt = new Map<string, number | null>();
        for (const l of (leiturasAnt ?? []) as {
          post_id: string;
          reach: number | null;
          captured_at: string;
        }[]) {
          if (!vistosAnt.has(l.post_id)) vistosAnt.set(l.post_id, l.reach);
        }
        for (const p of anteriores) {
          const conta = (p.meta?.["source_handle"] ?? null) as string | null;
          if (!conta) continue;
          const reach = vistosAnt.get(p.id) ?? 0;
          alcanceAnterior.set(conta, (alcanceAnterior.get(conta) ?? 0) + (reach ?? 0));
        }
      }

      type Acumulado = {
        conta: string;
        channel: string | null;
        posts: number;
        alcance: number;
        interacoes: number;
        comAlcance: number;
        rxSoma: number;
        rxN: number;
        rxAcima: number;
        outliers: number;
        melhor: MelhorPost | null;
      };
      const mapa = new Map<string, Acumulado>();

      for (const p of publicados) {
        const conta = ((p.meta?.["source_handle"] as string | undefined) ?? null) ?? "sem conta";
        const l = vistos.get(p.id) ?? null;
        const reach = l?.reach ?? null;
        const interacoes =
          (l?.likes ?? 0) + (l?.comments ?? 0) + (l?.saves ?? 0) + (l?.shares ?? 0);
        const base = baselines.find((b) => b.channel === p.channel && b.format === p.format);
        const mediana = base?.median_value && base.median_value > 0 ? base.median_value : null;
        const rx =
          reach !== null && mediana !== null ? Number((reach / mediana).toFixed(2)) : null;
        const engajamento = reach && reach > 0 ? Number(((interacoes / reach) * 100).toFixed(2)) : null;

        const item: MelhorPost = {
          id: p.id,
          title: p.title,
          conta: conta === "sem conta" ? null : conta,
          alcance: reach,
          rx,
          engajamento,
        };

        if (rx !== null && rx >= 2) {
          outliers.push({ id: p.id, title: p.title, conta: item.conta, rx });
        }

        if (reach !== null && (destaques.melhorAlcance?.alcance ?? -1) < reach) {
          destaques.melhorAlcance = item;
        }
        if (engajamento !== null && (destaques.melhorEngajamento?.engajamento ?? -1) < engajamento) {
          destaques.melhorEngajamento = item;
        }
        if (rx !== null && (destaques.maiorRx?.rx ?? -1) < rx) {
          destaques.maiorRx = item;
        }

        const a =
          mapa.get(conta) ??
          ({
            conta,
            channel: p.channel,
            posts: 0,
            alcance: 0,
            interacoes: 0,
            comAlcance: 0,
            rxSoma: 0,
            rxN: 0,
            rxAcima: 0,
            outliers: 0,
            melhor: null,
          } satisfies Acumulado);

        a.posts += 1;
        if (reach !== null) {
          a.alcance += reach;
          a.interacoes += interacoes;
          a.comAlcance += 1;
        }
        if (rx !== null) {
          a.rxSoma += rx;
          a.rxN += 1;
          if (rx >= 1) a.rxAcima += 1;
          if (rx >= 2) a.outliers += 1;
        }
        if (reach !== null && (a.melhor?.alcance ?? -1) < reach) a.melhor = item;
        mapa.set(conta, a);
      }

      outliers.sort((a, b) => b.rx - a.rx);

      for (const a of mapa.values()) {
        const anterior = alcanceAnterior.get(a.conta) ?? 0;
        contas.push({
          conta: a.conta,
          channel: a.channel,
          posts: a.posts,
          alcance: a.comAlcance ? a.alcance : null,
          alcanceMedio: a.comAlcance ? Math.round(a.alcance / a.comAlcance) : null,
          engajamento: a.alcance > 0 ? Number(((a.interacoes / a.alcance) * 100).toFixed(2)) : null,
          rxMedio: a.rxN ? Number((a.rxSoma / a.rxN).toFixed(2)) : null,
          outliers: a.outliers,
          consistencia: a.rxN ? Number(((a.rxAcima / a.rxN) * 100).toFixed(0)) : null,
          variacaoAlcance:
            anterior > 0 ? Number((((a.alcance - anterior) / anterior) * 100).toFixed(1)) : null,
          melhorPost: a.melhor,
        });
      }
      contas.sort((x, y) => (y.alcance ?? 0) - (x.alcance ?? 0));

      const consistente = contas
        .filter((c) => c.consistencia !== null)
        .sort((x, y) => (y.consistencia ?? 0) - (x.consistencia ?? 0))[0];
      if (consistente) {
        destaques.contaConsistente = {
          conta: consistente.conta,
          consistencia: consistente.consistencia ?? 0,
        };
      }
    }


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

    const perfil = perfilRes.data as { full_name: string | null } | null;

    return {
      nome: perfil?.full_name ?? null,
      ultimaColeta,
      kpis: {
        agendados: agendadosBrutos.length,
        aguardandoAprovacao: producao["review"] ?? 0,
        pautasNovas: sugestoes.length,
        alcance7d,
        contasConectadas: ((contasRes.data ?? []) as unknown[]).length,
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
      insights: ((insightsRes.data ?? []) as {
        id: string;
        statement: string;
        strength: number | null;
      }[]).map((i) => ({ id: i.id, statement: i.statement, strength: Number(i.strength ?? 0) })),
      outliers: outliers.slice(0, 5),
      producao,
    };
  });

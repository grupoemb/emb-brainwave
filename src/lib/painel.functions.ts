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
  producao: Record<string, number>;
};

export const carregarPainel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ organizationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<DadosPainel> => {
    const db = context.supabase as unknown as SupabaseClient;
    const org = data.organizationId;
    const agora = new Date();
    const em7d = new Date(agora.getTime() + 7 * 86_400_000).toISOString();
    const ha7d = new Date(agora.getTime() - 7 * 86_400_000).toISOString();

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
          .select("id, title, channel, format, meta")
          .eq("organization_id", org)
          .eq("status", "published")
          .gte("published_at", ha7d),
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
    }[];
    const idsPublicados = publicados.map((p) => p.id);
    let alcance7d: number | null = null;
    let ultimaColeta: string | null = null;
    const outliers: OutlierPainel[] = [];

    if (idsPublicados.length) {
      const [{ data: leituras }, { data: baseRaw }] = await Promise.all([
        db
          .from("post_metrics")
          .select("post_id, reach, captured_at")
          .in("post_id", idsPublicados)
          .order("captured_at", { ascending: false }),
        db
          .from("metric_baselines")
          .select("channel, format, metric, median_value")
          .eq("organization_id", org)
          .eq("metric", "reach"),
      ]);

      const vistos = new Map<string, number | null>();
      for (const l of (leituras ?? []) as {
        post_id: string;
        reach: number | null;
        captured_at: string;
      }[]) {
        if (!vistos.has(l.post_id)) vistos.set(l.post_id, l.reach);
        if (!ultimaColeta || l.captured_at > ultimaColeta) ultimaColeta = l.captured_at;
      }
      const soma = [...vistos.values()].reduce<number>((t, v) => t + (v ?? 0), 0);
      alcance7d = vistos.size ? soma : null;

      const baselines = (baseRaw ?? []) as {
        channel: string;
        format: string;
        median_value: number | null;
      }[];

      for (const p of publicados) {
        const reach = vistos.get(p.id) ?? null;
        const base = baselines.find((b) => b.channel === p.channel && b.format === p.format);
        const mediana = base?.median_value && base.median_value > 0 ? base.median_value : null;
        if (reach === null || mediana === null) continue;
        const rx = Number((reach / mediana).toFixed(2));
        if (rx >= 2) {
          outliers.push({
            id: p.id,
            title: p.title,
            conta: (p.meta?.["source_handle"] ?? null) as string | null,
            rx,
          });
        }
      }
      outliers.sort((a, b) => b.rx - a.rx);
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

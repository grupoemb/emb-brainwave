import { useQuery } from "@tanstack/react-query";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import type { ReelRanking } from "@/lib/ranking";

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function arred(v: number | null, casas = 2): number | null {
  if (v === null || !Number.isFinite(v)) return null;
  const f = 10 ** casas;
  return Math.round(v * f) / f;
}

function mediana(valores: number[]): number | null {
  const l = valores.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (l.length === 0) return null;
  const meio = Math.floor(l.length / 2);
  return l.length % 2 ? l[meio]! : ((l[meio - 1]! + l[meio]!) / 2);
}

type Metrica = {
  post_id: string;
  captured_at: string;
  impressions: number | null;
  reach: number | null;
  saves: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
};

/**
 * Ranking de reels por qualidade de crescimento.
 * Lê posts + post_metrics + social_accounts direto (RLS por organização)
 * e calcula score, alavanca, taxas e posições no cliente.
 */
export function useRanking(dias = 90) {
  const { organizationId } = useOrg();

  return useQuery<ReelRanking[]>({
    queryKey: ["radar-ranking", organizationId, dias],
    enabled: !!organizationId,
    staleTime: 60_000,
    queryFn: async () => {
      const desde = new Date(Date.now() - dias * 86_400_000).toISOString();

      const { data: posts, error: erroPosts } = await supabase
        .from("posts")
        .select("id, external_post_id, body, hook, meta, published_at")
        .eq("organization_id", organizationId!)
        .eq("channel", "instagram")
        .eq("format", "reel")
        .eq("status", "published")
        .gt("published_at", desde)
        .order("published_at", { ascending: false })
        .limit(500);
      if (erroPosts) throw new Error(erroPosts.message);
      if (!posts || posts.length === 0) return [];

      const ids = posts.map((p) => p.id);

      const [{ data: metricas, error: erroM }, { data: contas, error: erroC }] = await Promise.all([
        supabase
          .from("post_metrics")
          .select("post_id, captured_at, impressions, reach, saves, likes, comments, shares")
          .in("post_id", ids)
          .order("captured_at", { ascending: false })
          .limit(1000),
        supabase
          .from("social_accounts")
          .select("handle, followers")
          .eq("organization_id", organizationId!)
          .eq("channel", "instagram"),
      ]);
      if (erroM) throw new Error(erroM.message);
      if (erroC) throw new Error(erroC.message);

      const ultima = new Map<string, Metrica>();
      for (const m of (metricas ?? []) as Metrica[]) {
        if (!ultima.has(m.post_id)) ultima.set(m.post_id, m);
      }

      const seguidores = new Map<string, number | null>();
      for (const c of contas ?? []) {
        seguidores.set(String(c.handle ?? "").toLowerCase(), num(c.followers));
      }

      type Base = {
        r: ReelRanking;
        sc: number;
        cSh: number;
        cSv: number;
        cCo: number;
      };

      const base: Base[] = [];

      for (const p of posts) {
        const m = ultima.get(p.id);
        const rch = num(m?.reach);
        if (rch === null || rch <= 0) continue;

        const meta = (p.meta ?? {}) as Record<string, unknown>;
        const handle = (texto(meta["source_handle"]) ?? "perfil").replace(/^@/, "");
        const eid = texto(p.external_post_id) ?? p.id;
        const plays = num(m?.impressions);
        const sv = num(m?.saves) ?? 0;
        const sh = num(m?.shares) ?? 0;
        const cm = num(m?.comments) ?? 0;
        const lk = num(m?.likes) ?? 0;
        const fol = seguidores.get(handle.toLowerCase()) ?? null;

        const cSh = 5 * sh;
        const cSv = 3 * sv;
        const cCo = 2 * cm;
        const sc = cSh + cSv + cCo + lk;
        const somaAlavancas = cSh + cSv + cCo;

        const lever = cSh >= cSv && cSh >= cCo ? "distribuicao" : cSv >= cCo ? "valor" : "ressonancia";

        base.push({
          sc,
          cSh,
          cSv,
          cCo,
          r: {
            handle,
            id: eid,
            url: texto(meta["permalink"]) ?? `https://instagram.com/reel/${eid}`,
            caption: texto(p.body),
            published_at: texto(p.published_at),
            plays,
            reach: rch,
            saves: sv,
            shares: sh,
            comments: cm,
            likes: lk,
            reach_rate: fol && fol > 0 ? arred((rch / fol) * 100, 1) : null,
            shares_pr: arred((sh / rch) * 100),
            saves_pr: arred((sv / rch) * 100),
            eng_pr: arred(((lk + cm + sv + sh) / rch) * 100),
            vx: null,
            score: sc,
            lever,
            lever_pct:
              somaAlavancas > 0
                ? Math.round((Math.max(cSh, cSv, cCo) / somaAlavancas) * 100)
                : null,
            hook: texto(p.hook),
            theme: texto(meta["theme"]),
            intent: texto(meta["intent"]),
            rank_geral: null,
            rank_perfil: null,
          },
        });
      }

      // vx = views vs. mediana de views do próprio perfil
      const porPerfil = new Map<string, number[]>();
      for (const b of base) {
        if (b.r.plays === null) continue;
        const l = porPerfil.get(b.r.handle) ?? [];
        l.push(b.r.plays);
        porPerfil.set(b.r.handle, l);
      }
      const medianas = new Map<string, number | null>();
      for (const [h, l] of porPerfil) medianas.set(h, mediana(l));

      for (const b of base) {
        const med = medianas.get(b.r.handle) ?? null;
        b.r.vx = med && med > 0 ? arred((b.r.plays ?? 0) / med) : null;
      }

      const ordenado = base.sort(
        (a, b) => b.sc - a.sc || (b.r.reach ?? 0) - (a.r.reach ?? 0),
      );

      const contador = new Map<string, number>();
      return ordenado.map((b, i) => {
        const pos = (contador.get(b.r.handle) ?? 0) + 1;
        contador.set(b.r.handle, pos);
        return { ...b.r, rank_geral: i + 1, rank_perfil: pos };
      });
    },
  });
}

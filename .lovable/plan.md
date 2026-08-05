# Seguidores em todas as abas + Reels Radar › Painel ranking-first

Duas mudanças de frontend. Confirmei que as funções do banco `followers_overview(p_org)` e `radar_ranking(p_org, p_dias)` já existem, então nada de backend novo, nada de migration.

## Parte A — KPI "Seguidores"

**`src/hooks/useFollowers.ts`** (novo): React Query + `supabase.rpc("followers_overview", { p_org: organizationId })`, habilitado só com `organizationId` (padrão dos hooks atuais, RLS aplicado). Normaliza para `{ total, contas: [{ handle, followers, delta_7d, delta_30d }] }`.

**`src/components/ui/KpiSeguidores.tsx`** (novo): cartão `.cartao` no mesmo formato visual dos KPIs existentes — rótulo "Seguidores" em `.rotulo`, total em `.numero` com formatação compacta (`compacto` de `src/lib/metricas.ts`, k/mi pt-BR), e abaixo a linha "+N (7d)" em `text-bom` (≥0) ou `text-ruim` (<0); "—" quando `delta_7d` é nulo. Estados de carregando (skeleton) e erro/vazio silencioso ("—").

**Onde entra:**
- Painel inicial (`src/components/painel/Painel.tsx`) — primeiro item da faixa de mini-KPIs.
- Métricas (`src/components/metricas/Metricas.tsx`) — dentro da faixa de KPIs da aba geral.
- Reels Radar › Painel — primeiro KPI da nova faixa (Parte B).

Cartões por conta que já mostram seguidores continuam como estão; a novidade é o total consolidado.

## Parte B — Reels Radar › Painel

**`src/hooks/useRanking.ts`** (novo): `supabase.rpc("radar_ranking", { p_org, p_dias: 90 })`, já ordenado por score.

**`src/lib/ranking.ts`** (novo): mapa `LEVERS` (distribuição/valor/ressonância com rótulo, ícone lucide, cor e função de métrica), `ROTULO_GANCHO` e `ROTULO_INTENCAO` em pt-BR, e helpers de moda (alavanca/gancho/intenção dominantes nos top 10).

**`src/components/radar/PainelContas.tsx`** reescrito na ordem:

1. **Faixa de KPIs** — Seguidores (total) · Reels no período · Melhor alavanca. Abaixo, linha de contexto em `text-xs text-muted`: "Ranking por qualidade de crescimento — compartilhamentos, salvamentos e comentários por alcance. Views é vaidade."
2. **Leitura da semana** — `.cartao border-l-2 border-l-azure` com ícone Sparkles. Chama `supabase.functions.invoke("radar_leitura", { body: { organization_id, dias: 90 } })`; mostra a frase em `.prosa`, `padroes` como pills e `recomendacoes` como lista com check. Botão "Atualizar" reenvia com `force: true`. Sem `leitura` no retorno → "Leitura por IA indisponível agora — os rankings abaixo seguem completos." Skeleton enquanto carrega.
3. **Inteligência rápida** — 3 mini-stats calculados no cliente sobre `rank_geral <= 10` (alavanca dominante · gancho campeão · intenção campeã) + frase templated "Seus campeões são {intenção} com gancho {gancho}, que vencem por {alavanca}."
4. **Top 10 do período** — lista principal: posição em `.numero` muted, badge `@handle` (bg-azure/14, text-azureClaro), caption truncada em 1 linha, chip da alavanca (ícone/cor de LEVERS + métrica), score em `.numero` destaque, pill de vx (verde ≥1.3, ícone flame ≥2 — reaproveita `PillVx`). Clique expande: barra de `lever_pct`, taxas (compart/alcance, salv/alcance, engaj/alcance, alcance/seguidores), gancho·tema·intenção e "abrir reel" em nova aba.
5. **Top 3 de cada perfil** — uma seção por handle, título "Top 3 · @handle", linhas compactas (posição, caption, chip de alavanca, score) pelos menores `rank_perfil`.
6. **Visão geral das contas** — colapsável fechada, recebendo os `CartaoConta`, o `RankingReels` e os dois `BarrasContas` que hoje ocupam o topo. `DrawerConta` continua abrindo ao clicar num cartão.

Estados vazios com frase própria em cada bloco; todos os números em `.numero` com formatação compacta.

## Notas técnicas

- Novos arquivos: `src/hooks/useFollowers.ts`, `src/hooks/useRanking.ts`, `src/lib/ranking.ts`, `src/components/ui/KpiSeguidores.tsx`, mais 2–3 subcomponentes do painel do radar (`LeituraSemana.tsx`, `LinhaRanking.tsx`) para manter os arquivos pequenos.
- Nenhuma tabela, function ou migration nova; só leitura via RPC/Edge Function existentes, respeitando RLS por `organizationId` do `useOrg()`.

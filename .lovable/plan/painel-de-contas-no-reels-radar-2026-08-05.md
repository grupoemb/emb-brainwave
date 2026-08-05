# Painel de contas no Reels Radar

Nova sub-aba "Painel" como primeira e padrão do Reels Radar, monitorando somente as contas próprias, em leitura pura sobre o que já existe no banco.

## O que muda

**Sub-abas**: `Painel · Radar · Biblioteca`. "Painel" passa a ser o destino padrão de `/radar`; links existentes que já apontam para Radar ou Biblioteca continuam funcionando.

**Cabeçalho da tela**: título "Suas contas" com a nota de frescor "coletado há X" (baseado na coleta mais recente conhecida das métricas). Sem coleta, mostra o estado vazio "Aguardando a primeira coleta das contas."

**Dois gráficos comparativos** acima dos cards, lado a lado no desktop:
- "Média de views por conta" — barras azure (#00a4ff) com gradiente vertical.
- "Engajamento % por conta" — barras verdes (#3ecf8e).
Ambos sem eixo desenhado, grade só horizontal em rgba(148,163,184,.12), ticks #8294ab, ordenados por valor decrescente, rótulo = @handle.

**Um card por conta** (.cartao p-5, clicável):
- Cabeçalho: @handle em negrito + seguidores compactados (12,4 mil / 1,2 mi) em .numero muted.
- Grade de 4 mini-métricas com .rotulo em cima e .numero embaixo: Média de views, Alcance médio, Salvam. médio, Engajamento (com %).
- Rodapé "Melhor reel": título truncado, views em .numero e pill do vx (verde ≥ 1,3; ícone de chama quando ≥ 2).
- Nota "N reels monitorados".
- Clique leva à sub-aba Radar já com o @handle preenchido e a análise disparada automaticamente.

Contas sem reels não aparecem — a própria função do banco já as omite, e nenhum placeholder é criado.

## Detalhes técnicos

- **Dados**: `supabase.rpc("accounts_overview", { p_org: organizationId })` retorna um array com `handle, followers, reels, avg_views, median_views, avg_reach, avg_saves, eng_pct, best_title, best_views, best_vx`. Novo `src/lib/contas.ts` com o tipo `ContaVisao`, normalização dos números e o formatador compacto k/mi. Novo hook `src/hooks/useContas.ts` (TanStack Query, `enabled: !!organizationId`), que também lê o `max(captured_at)` de `post_metrics` das contas da org para o texto de frescor.
- **Rota**: `src/routes/_authenticated/radar.tsx` ganha `"painel"` no enum de `aba`, com fallback e default em `"painel"`. Aceita também `handle` opcional no search para o auto-disparo.
- **Componentes novos**: `src/components/radar/PainelContas.tsx` (cabeçalho, gráficos, grade de cards, estados de carregamento/vazio), `src/components/radar/CartaoConta.tsx` e `src/components/radar/BarrasContas.tsx` (Recharts, reaproveitando a config visual de `GraficoAlcance`).
- **Auto-análise**: `Radar.tsx` passa a navegar para `{ aba: "radar", handle }`; `RadarColeta.tsx` lê esse search, preenche o campo e dispara a coleta uma única vez por handle (a função `radar_scan` já resolve conta própria via API oficial). O search é limpo depois para não redisparar no refresh.
- Somente leitura via RLS existente; nenhuma tabela, migration ou edge function nova.

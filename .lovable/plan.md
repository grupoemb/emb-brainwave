# Melhorias no Reels Radar

## 1. Ranking "Melhores reels de todas as contas"

Hoje esse bloco já existe dentro do Painel (`TopReelsContas`), alimentado junto com o resto do painel. A revisão pedida separa isso em peças próprias:

- **Novo hook `src/hooks/useTopReels.ts`** — chama `radar_own_top_reels` (`p_org`, `p_limit: 12`) com a org do `useOrg()`, normaliza os campos `{ id, handle, url, caption, views, vx }` reaproveitando `normalizarReels` de `src/lib/contas.ts`.
- **Novo componente `src/components/radar/RankingReels.tsx`** — lista já ordenada por views: posição `#1, #2…` em `.numero text-muted`, caption truncada em 1 linha, badge `@handle` em pill `bg-azure/14 text-azureClaro`, views em `.numero` (formato compacto k/mi) e pill de vx (verde ≥ 1.3, ícone flame `#f6bd24` quando ≥ 2). Cada linha é um link que abre a `url` em nova aba.
- **`PainelContas.tsx`** — passa a usar `useTopReels` + `RankingReels`, renderizados ABAIXO da grade de `CartaoConta`, com título `h2` em `.rotulo`: "Melhores reels de todas as contas". Vazio: "Aguardando a coleta das contas."
- `TopReelsContas.tsx` sai de uso e é removido para não deixar duas versões do mesmo bloco.

## 2. Conta própria x concorrente na coleta

- **`src/lib/radar.ts`** — `RespostaScan` ganha `source: string | null` (lido de `o["source"]`); `ReelColetado` ganha `reach` e `saves` (lidos de `x["reach"]` e `x["saves"]` via o mesmo helper numérico).
- **`RadarColeta.tsx`** — acima da tabela, selo discreto conforme `resultado.source`: verde (`pill-bom`) "Sua conta · dados oficiais (grátis)" para `own`; neutro para `competitor` "Concorrente · coleta pública". Sem `source`, nenhum selo.
- **`TabelaReels.tsx`** — se algum reel tiver `reach != null`, mostra as colunas extras "Alcance" e "Salv." (valores em `.numero`, alinhados à direita, `—` quando nulo). Quando nenhum reel tem `reach`, as colunas não são renderizadas e o layout atual fica intacto.

## Notas técnicas

Somente frontend: nenhuma tabela, migration ou edge function nova; leitura via RPCs existentes respeitando o RLS. Números sempre com a classe `.numero`, cores e pills da fundação visual.

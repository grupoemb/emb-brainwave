# Corrigir o Reels Radar (erro "column reference \"plays\" is ambiguous")

## O que está acontecendo

O Painel do Reels Radar carrega os KPIs, mas o ranking falha com `column reference "plays" is ambiguous`. Confirmei a causa lendo a função no banco: `public.radar_ranking(p_org, p_dias)` declara colunas de retorno chamadas `plays`, `reach`, `saves`, `shares`, `comments`, `likes` etc. Dentro do corpo, a CTE `latest` também tem uma coluna `plays`, e as referências a `plays` (na CTE `med` e no `select` final) não estão qualificadas — o Postgres não sabe se é a coluna da CTE ou o parâmetro de saída da função, e aborta.

Por isso "Reels no período" mostra 0, "Melhor alavanca" e "Inteligência rápida" ficam vazios e o Top 10 exibe o erro.

## A correção

Uma migration que faz `CREATE OR REPLACE FUNCTION public.radar_ranking(...)` com o mesmo corpo e a mesma assinatura, apenas qualificando todas as referências de coluna:

- na CTE `med`: `percentile_cont(0.5) within group (order by l.plays)` e `where l.plays is not null`, usando um alias explícito para `latest`;
- no `select` final: alias em `calc` (`from calc c`) e todas as colunas prefixadas (`c.h`, `c.plays`, `c.rch`, ...).

Nenhuma mudança de lógica, de ordenação, de score ou de nomes de retorno — o frontend (`useRanking.ts`, `PainelContas.tsx`) continua igual. Nenhuma tabela nova, nenhuma edge function nova.

## Depois de aplicar

Rodo a RPC direto no banco para confirmar que retorna linhas e checo o Painel do Radar (Top 10, Top 3 por perfil, KPIs "Reels no período" e "Melhor alavanca").

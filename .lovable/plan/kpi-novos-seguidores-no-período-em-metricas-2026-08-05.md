# KPI "Novos seguidores no período" em /metricas

Hoje a aba Métricas mostra apenas o cartão **Seguidores** (total consolidado, com variação fixa de 7 dias vindo de `followers_overview`). Ele ignora o período selecionado (7/14/30/90 dias), o filtro de conta e o modo de comparação. Falta o KPI de **novos seguidores no período**.

## O que será construído

1. Um novo cartão **Novos seguidores** no grupo "Alcance" da aba Geral, ao lado de Seguidores:
   - valor = seguidores no fim do período − seguidores no início do período;
   - respeita o período escolhido (7/14/30/90) e o filtro de conta (`todas` soma as contas, `@perfil` mostra só ela);
   - quando a comparação está ligada, mostra o mesmo cálculo no período anterior e a variação, no mesmo padrão dos outros `CartaoKpi`;
   - sparkline da evolução diária de seguidores no período;
   - tooltip/fórmula explicando o cálculo, como nos demais cartões.
2. O cartão **Seguidores** existente passa a exibir a variação do período selecionado em vez do "(7d)" fixo, para os dois ficarem coerentes.

## Estado dos dados (verificado)

- `follower_history` tem hoje **apenas 1 snapshot por perfil** (05/08/2026: `fabiolouzada_`, `b7school`, `brunopiacentini.b7`).
- `post_metrics.followers_delta` está **100% nulo** (0 de 524 linhas).

Ou seja: ainda não existe base para calcular ganho de seguidores. O KPI será entregue completo e correto, mas exibirá um estado explícito de **"histórico insuficiente — coletando"** (com a data do primeiro snapshot) enquanto houver menos de 2 dias de histórico, e passará a mostrar números reais automaticamente conforme a coleta diária acumular. Sem isso, o cartão exibiria "0" e enganaria a leitura.

## Detalhes técnicos

- Nenhuma mudança de backend: sem tabelas, sem functions, sem migrations.
- Novo hook `src/hooks/useSeguidoresPeriodo.ts` chamando a RPC existente `metric_daily(p_org, p_handle, 'followers', p_from, p_to)` — uma chamada por conta conectada quando o filtro é "todas", agregando as séries por dia; e a série do período anterior quando a comparação está ativa.
- Cálculo do delta e da série em `src/lib/metricas.ts` (funções puras, seguindo `compacto`/`numero`).
- Renderização em `src/components/metricas/Metricas.tsx` reutilizando `CartaoKpi` (família `alcance`), e ajuste em `src/components/ui/KpiSeguidores.tsx` para receber o delta do período.
- Cores semânticas já existentes: `text-bom` para ganho, `text-ruim` para perda, `text-muted` para sem base.

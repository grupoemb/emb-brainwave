# Métricas 2.0 — painel completo de Instagram

O `/metricas` hoje mostra 10 cartões iguais em grade, um gráfico de alcance, um donut de formatos e uma tabela. Tudo é somatório simples: falta taxa, ritmo, comparação entre contas, leitura por gancho/pilar/tema e leitura por horário — e visualmente é uma grade plana sem hierarquia.

O que existe no banco e ainda não é usado: `impressions` (preenchido em todas as leituras), o **histórico** de leituras por post (até 5 capturas por post, dá curva de crescimento), `hook`, `pillar_id`, `meta.theme`, `meta.intent`, as 3 contas em `meta.source_handle`, os 18 baselines e a função `get_perf_aggregates`. Não há `clicks`, `watch_time_s`, `retention_pct` nem `followers_delta` (colunas 100% vazias), então nada de retenção/seguidores — seria número inventado.

## Nova estrutura da tela

```text
[ filtros: período · conta · pilar · comparação · atualizar ]
[ HERO: Alcance do período — número grande, sparkline, variação vs anterior ]
[ 4 cartões de destaque: Impressões · Engajamento · rx médio · Taxa de acerto ]
[ sub-abas:  Visão geral · Conteúdo · Ritmo & Horários · Contas ]
```

### Visão geral
- Cartão herói de alcance com sparkline diária e comparação sempre visível.
- Grade de taxas (o que Social Blade/Metricool mostram e falta aqui): impressões, frequência (impressões ÷ alcance), taxa de salvamento, de compartilhamento, de comentário, de curtida, engajamento total, alcance médio por post, interações por post.
- **Funil de interação**: alcance → interações → salvamentos/compartilhamentos, em barras proporcionais.
- Cada cartão ganha micro-sparkline do próprio indicador no período.

### Conteúdo
- **Desempenho por formato**: barras com rx médio + nº de posts + alcance médio (substitui o donut, que só contava quantidade).
- **Por gancho**, **por pilar** e **por tema**: rankings horizontais com rx médio e volume, destacando o que está acima de 1,3× e abaixo de 0,7×.
- **Top 5 / Piores 5** lado a lado, com pill de rx e ícone de fora da curva.
- Tabela de posts reformulada: colunas ordenáveis (alcance, salvamentos, compartilhamentos, comentários, curtidas, rx, data), busca por título, barra proporcional de rx na célula e filtro rápido "só fora da curva".

### Ritmo & Horários
- **Mapa de calor dia da semana × faixa de 3h** com alcance médio — a leitura de "quando postar" que hoje é só um cartão de texto.
- Cadência: posts por semana, intervalo médio entre posts, dias sem publicar.
- **Curva de maturação**: usando o histórico de `post_metrics`, quanto do alcance final o post junta entre a primeira e a última leitura (velocidade média das primeiras horas).
- Consistência: dispersão do rx (quanto o resultado oscila entre posts).

### Contas
- Comparativo das contas conectadas: alcance, posts, engajamento e rx médio lado a lado, com barras relativas.

## Estados e detalhes de UX
- Comparação com o período anterior ligada por padrão, com o rótulo do intervalo comparado no topo.
- Cada indicador mantém o tooltip de fórmula que já existe.
- Indicador vazio nunca vira zero: mostra "—" com o motivo (sem baseline, sem leitura).
- Esqueletos por seção e mensagem vazia específica quando o filtro zera o resultado.
- Entrada em cascata igual ao resto do app; nada de animação em loop.

## Detalhes técnicos
- `src/lib/metricas.functions.ts`: incluir `hook`, `pillar_id`, `meta.theme`, `meta.intent` no select de `posts` e devolver o histórico completo de leituras (já vem, hoje é descartado na deduplicação).
- `src/lib/metricas.ts`: novas funções puras — `taxas()`, `porDimensao()` (formato/gancho/pilar/tema), `mapaDeCalor()`, `cadencia()`, `maturacao()`, `porConta()`, `serieDeIndicador()` para as sparklines. Reaproveitar `montarLinhas`, `variacao` e os limiares de rx existentes.
- `src/hooks/useMetricas.ts`: expor os novos agregados memoizados; sem mudança de query key além do que já existe.
- Novos componentes em `src/components/metricas/`: `HeroAlcance.tsx`, `GradeTaxas.tsx`, `FunilInteracao.tsx`, `BarrasDimensao.tsx`, `MapaDeCalor.tsx`, `CurvaMaturacao.tsx`, `ComparativoContas.tsx`, `SubAbas.tsx`, mais Sparkline reutilizável. `Metricas.tsx` vira só a composição das seções.
- `DonutFormatos.tsx` sai da tela (substituído por `BarrasDimensao`); `CartaoKpi` ganha props opcionais de sparkline e de barra, sem quebrar os usos atuais.
- Recharts para área/barras/sparkline; o mapa de calor é grade CSS com opacidade do token azure.
- Somente leitura sobre as tabelas existentes, filtrando por `organizationId` e respeitando o RLS. Sem migrations, sem edge functions, sem novas dependências.

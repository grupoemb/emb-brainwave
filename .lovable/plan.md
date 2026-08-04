# Tela /metricas — desempenho real

Substituir o placeholder de Métricas por um painel completo alimentado pelas tabelas já existentes (`posts`, `post_metrics`, `metric_baselines`, `social_accounts`, `content_pillars`), sempre filtrado pela organização do usuário e respeitando o RLS.

Verificado no banco: há 49 posts publicados, 154 leituras em `post_metrics` (última em 04/08/2026), 18 baselines e 2 contas conectadas — a tela terá dados reais desde o primeiro carregamento.

## Regra central

- **rx** = alcance da leitura mais recente do post ÷ `median_value` da baseline (mesma organização, canal, formato, métrica `reach`).
- Sem baseline ou sem alcance: `rx = null` e exibição `—`.
- Limiares fixos: rx ≥ 1.3 verde (`pill-bom`), 0.7–1.3 neutro (sem cor), < 0.7 coral (`pill-ruim`).

## Topo

Barra de chips (~30px, raio 8px, rolagem horizontal no mobile):

- **Período**: 7 / 30 / 90 dias (padrão 30).
- **Conta**: "Todas" + contas com `connected_at` preenchido; filtra posts por `meta->>source_handle`.
- **Pilar**: "Todos" + pilares da organização.

À direita: frescor "coletado há X" com base no maior `captured_at` e botão de atualizar cujo ícone gira durante o fetch e completa a volta ao parar.

## Faixa de 10 KPIs

Grade 2 → sm:3 → xl:5, cartões `min-h` 5.9rem, cada um com "?" no hover mostrando a fórmula em uma frase:

Alcance total · Salvamentos · Compartilhamentos · Comentários · Curtidas · Engajamento médio ((curtidas+comentários+salvamentos+shares) ÷ alcance, em %) · Posts publicados no período · rx médio · Melhor formato (maior rx médio, mínimo 3 posts) · Melhor horário (faixa horária de maior alcance médio, fuso America/Sao_Paulo).

Números em `.numero text-2xl` com contagem animada de 0,9s; valores sem base viram `—` em muted, sem animação.

## Meio (grid lg de 3 colunas)

- **Área (2 colunas)**: alcance por dia no período, com toggle "acumulado". Recharts na config canônica: sem linha de eixo nem tick line, grade horizontal `rgba(148,163,184,.12)`, ticks `#8294ab` tamanho 11, área `#00a4ff` com gradiente vertical .34 → .02, strokeWidth 2, dot false, activeDot r=3.5, type monotone, tooltip fundo `#16223a`, borda `rgba(148,163,184,.3)`, raio 8.
- **Donut (1 coluna)**: posts por formato, innerRadius 50, outerRadius 80, stroke none, paleta `['#00a4ff','#00e7ff','#3ecf8e','#f6bd24','#a78bfa','#ff7a6b']`, legenda com contagem.

## Base — tabela

Toggle em chips "Top posts" / "Piores posts", ordenada por rx. Colunas: título (truncado), conta, formato, data, alcance, salvamentos, shares, rx (pill com os limiares). `min-w-[820px]` dentro de `overflow-x-auto`, todos os números à direita com `.numero`, zero sem base vira `—`. Clique na linha navega para `/post/:id`.

## Estados

- Sem posts no recorte: "Nenhum post no período selecionado".
- Nenhuma leitura em `post_metrics`: "Aguardando a primeira coleta das contas".
- Carregamento: skeletons estáticos no padrão já usado no projeto (sem loop).

## Notas técnicas

- Novo `src/lib/metricas.functions.ts` com server functions autenticadas (`requireSupabaseAuth`, RLS como usuário): listar posts publicados do período (status `published`, canal `instagram`), listar `post_metrics` ordenado por `captured_at desc` (dedup por `post_id` no cliente), listar `metric_baselines` e listar contas conectadas.
- Novo `src/hooks/useMetricas.ts` com TanStack Query, agregando KPIs, série diária, distribuição por formato e ranking em memória.
- Componentes em `src/components/metricas/`: `FiltrosMetricas`, `CartaoKpi` (com contagem animada via GSAP e respeito a `prefers-reduced-motion`), `GraficoAlcance`, `DonutFormatos`, `TabelaPosts`, `EsqueletoMetricas`.
- Rota `src/routes/_authenticated/metricas.tsx` passa a renderizar a tela, mantendo o `head()` atual.
- Sem migrations, sem tabelas novas, sem edge functions; apenas leitura. Nenhum dado de negócio em localStorage.

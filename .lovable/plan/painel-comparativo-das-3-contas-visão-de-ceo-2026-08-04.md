# Painel: comparativo das 3 contas (visão de CEO)

Novo bloco na home, abaixo dos mini-KPIs, comparando lado a lado as contas com posts publicados (hoje: brunopiacentini.b7, fabiolouzada_ e b7school). Só leitura das tabelas existentes, filtrando pela organização e respeitando o RLS.

## Seletor de janela

O bloco usa o mesmo seletor 7 / 14 / 30 dias já presente no "Fora da curva", agora compartilhado pelo painel inteiro (uma única consulta serve os dois blocos).

## Pódio das contas

Três cartões, um por conta, ordenados pelo alcance total no período, com medalha de posição (1º/2º/3º):

- Handle + canal (dot da cor do canal) e nº de posts publicados no período
- Alcance total e alcance médio por post
- Engajamento: (curtidas + comentários + salvos + compartilhados) / alcance, em %
- rx médio (desempenho vs. a mediana do formato) com pill verde/âmbar/vermelho
- Nº de posts fora da curva (rx ≥ 2) com ícone flame
- Barra de participação no alcance total da organização
- Variação do alcance vs. a janela anterior de mesmo tamanho (seta + %)

## Melhor post de cada conta

Dentro do cartão da conta, uma linha "melhor post": título truncado, alcance, pill de rx. Clique abre `/post/:id` já com `origem=painel` (mantém o breadcrumb e o botão "Voltar ao Painel" que já existem).

## Faixa de destaques

Uma linha compacta acima do pódio com os campeões do período, cada um citando a conta responsável:

- Melhor alcance (post)
- Melhor engajamento (post, entre os que têm alcance registrado)
- Maior rx (fora da curva do período)
- Conta mais consistente (maior % de posts com rx ≥ 1)

## Estados

- Carregando: skeleton com 3 cartões no mesmo formato.
- Sem posts publicados na janela: "Nenhum post publicado nesta janela — experimente 30 dias."
- Conta sem leitura de métricas: mostra "—" nos números em vez de zero.

## Detalhes técnicos

- `src/lib/painel.functions.ts`: a server function `carregarPainel` passa a retornar também `contas` (agregados por `meta->>'source_handle'`) e `destaques`. Reaproveita as leituras de `post_metrics` já buscadas para os publicados da janela; passa a selecionar também `likes, comments, saves, shares` na consulta de `post_metrics`, e busca em paralelo os publicados da janela anterior só para a variação de alcance. Os baselines de `reach` já carregados dão o rx por post.
- Cálculo do rx e do critério de outlier seguem o que já existe (`LIMITE_OUTLIER = 2`), reaproveitando `numero`, `classeRx` e `ehOutlier` de `src/lib/metricas.ts`.
- Novos componentes em `src/components/painel/`: `ComparativoContas.tsx` (pódio + melhor post) e `DestaquesPeriodo.tsx` (faixa de campeões), compostos em `Painel.tsx`. O seletor de janela sobe para o topo do painel.
- Sem migrations, sem tabelas novas, sem edge functions.

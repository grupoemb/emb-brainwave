# Drill-down nos gráficos de Métricas

Clicar em qualquer ponto/fatia/barra/célula dos gráficos abre um painel lateral com a lista dos posts exatos que formam aquele número.

## Como vai funcionar

Um painel lateral (desliza da direita, fecha com Esc ou clique fora) com:

- Cabeçalho: o recorte clicado (ex.: "Formato · Reels", "12/03", "Qua 18-21h", "@conta").
- Resumo em 4 números: nº de posts, alcance total, alcance médio, rx médio.
- Lista dos posts do recorte, ordenada por alcance (maior primeiro): título, conta, data, alcance, pill de rx e o ícone de fora da curva quando rx ≥ 2,0.
- Clique num post leva para a tela do post; a trilha existente permite voltar.
- Botão "Ver na tabela" — aplica o mesmo recorte na tabela de posts abaixo, com uma faixa de contexto indicando o filtro ativo.
- Estado vazio padrão da marca quando o recorte não tem post com dados.

## Onde o clique passa a funcionar

- Alcance por dia (Overview): clique num dia → posts publicados naquele dia.
- Donut de formatos: clique na fatia ou no item da legenda → posts do formato.
- Barras por dimensão (formato, gancho, pilar, tema, intenção, conta): clique na barra → posts daquele valor.
- Mapa de calor (Ritmo): clique na célula → posts daquele dia da semana + faixa de horário.
- Comparativo de contas: clique na conta → posts da conta.

Todos ganham cursor de clique, realce no hover e acesso por teclado (foco + Enter).

## Detalhes técnicos

- Novo `src/components/metricas/PainelDrill.tsx` (Radix Dialog/Sheet, seguindo o padrão do `MenuFiltro`), mais `src/components/metricas/ListaDrill.tsx` para a lista/resumo.
- Nova função `filtrarPorRecorte(linhas, recorte)` em `src/lib/metricas.ts`, com o tipo `Recorte = { tipo: "dia" | "dimensao" | "calor"; ... }`. Reaproveita `calcularTaxas` para o resumo e `partesSaoPaulo` para dia/faixa horária — nenhum dado novo é buscado, tudo vem das `LinhaMetrica` já carregadas.
- `BarrasDimensao`, `DonutFormatos`, `GraficoAlcance` e `MapaDeCalor` recebem um `aoSelecionar?` opcional; sem ele o comportamento atual não muda.
- `Metricas.tsx` guarda o recorte ativo em estado e, no "Ver na tabela", repassa o filtro para `TabelaPosts` (mesmo mecanismo já usado por `soOutliers`).
- Sem alterações de banco, RLS ou backend.

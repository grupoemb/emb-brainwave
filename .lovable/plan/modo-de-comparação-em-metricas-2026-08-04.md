# Modo de comparação em /metricas

Permitir escolher um segundo período e ver a variação percentual dos KPIs e do rx médio entre o período atual e o de comparação.

## Como fica na tela

Na barra de filtros, um novo grupo de chips **Comparar**:

- `Desligado` (padrão — tela igual à de hoje)
- `Período anterior` (os mesmos N dias imediatamente antes do período atual)
- `Personalizado` (abre dois campos de data: início e fim)

Com a comparação ligada:

- Cada cartão de KPI ganha, abaixo do número, uma linha pequena com a variação:
  `+18,4%` em verde (pill-bom), `-12,1%` em coral (pill-ruim), variação entre -2% e +2% neutra em muted. Ao lado, o valor do período de comparação em texto muted (ex.: "antes 12.480").
- Sem base para comparar (KPI nulo em um dos lados, ou divisão por zero) → mostra `—`, sem cor.
- KPIs textuais (Melhor formato, Melhor horário) não mostram percentual; mostram o valor anterior em muted quando diferente.
- O tooltip "?" de cada cartão passa a mencionar também o intervalo comparado.
- Um rótulo discreto acima da faixa de KPIs indica os dois intervalos: `01–30 abr vs 02–31 mar`.
- Gráfico de área, donut e tabela continuam refletindo apenas o período atual (a comparação é só de KPIs, conforme pedido).

Ao trocar o período principal, o intervalo "período anterior" é recalculado automaticamente. Trocar conta/pilar aplica os mesmos filtros aos dois períodos.

## Detalhes técnicos

- `src/lib/metricas.functions.ts`: `carregarMetricas` passa a aceitar, além de `dias`, um par opcional `desde`/`ate` (ISO). A janela de busca de posts usa esse par quando presente; a lógica de query e o RLS permanecem iguais. Nenhuma tabela, migration ou edge function é criada.
- `src/hooks/useMetricas.ts`: novo estado `comparacao` (`off | anterior | custom`) e `intervaloComparacao`. Uma segunda `useQuery` (chave `["metricas", org, desde, ate]`, habilitada só quando a comparação está ligada) busca o período de comparação, aplica os mesmos filtros de conta/pilar e roda `montarLinhas` + `calcularKpis`.
- `src/lib/metricas.ts`: helpers puros novos — `intervaloAtual(dias)`, `intervaloAnterior(dias)`, `variacao(atual, anterior)` (retorna `null` quando qualquer lado é nulo ou o anterior é 0) e `classeVariacao(v)` com faixa neutra de ±2%.
- `src/components/metricas/CartaoKpi.tsx`: props opcionais `valorAnterior` / `textoAnterior`; a contagem animada de 0,9s continua só no valor principal, a variação aparece estática (sem animação em loop).
- `src/components/metricas/FiltrosMetricas.tsx`: grupo de chips "Comparar" + inputs de data no modo personalizado, no mesmo estilo de chip de 30px já existente.
- Estados de carregamento do segundo período reutilizam o esqueleto/`—` já existente, sem piscar o valor principal.

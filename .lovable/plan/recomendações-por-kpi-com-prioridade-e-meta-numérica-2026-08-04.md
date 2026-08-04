# Recomendações por KPI com prioridade e meta numérica

Novo bloco **O que fazer em seguida** na sub-aba Benchmark de `/metricas`, logo abaixo dos termômetros. Só leitura e cálculo no cliente — nenhuma tabela nova, nenhuma migration.

## O que aparece

Uma lista de recomendações geradas automaticamente, uma por indicador que está abaixo do próximo patamar. Cada cartão traz:

- **Pill de prioridade**: Alto impacto (coral), Médio (âmbar), Baixo (azure).
- **Indicador e faixa atual** — por exemplo "Salvamentos por post · Regular".
- **Meta numérica exata para subir de faixa**: valor atual → limiar da próxima faixa, mais o delta absoluto e em % ("faltam 214 de alcance por post, +18%").
- **Uma ação concreta em uma frase**, específica do indicador (ex.: salvamentos → "transforme o carrossel em passo-a-passo salvável, com o resumo no último slide").
- Barra fina de progresso até o limiar da próxima faixa.

Ordenação: prioridade alta primeiro; dentro da mesma prioridade, o menor esforço relativo (menor delta %) vem antes — o "ganho mais barato" fica no topo.

## Como a prioridade é definida

Combinação de dois fatores, sem números mágicos escondidos na tela (a lógica aparece em texto no cartão):

1. **Distância da faixa**: quem está em "abaixo do padrão" pesa mais que quem está em "regular"; quem já está em "excelente" some da lista.
2. **Peso do indicador no resultado**: alcance e salvamentos/compartilhamentos (sinais de distribuição) pesam mais que curtidas.

Resultado: alto = faixa ruim em indicador de peso alto, ou muito longe do limiar; médio = regular em indicador de peso alto, ou ruim em indicador de peso baixo; baixo = ajustes finos perto do próximo limiar.

## Cobertura

Entram na análise os 6 termômetros existentes (alcance, impressões, curtidas, comentários, salvamentos, compartilhamentos) mais as 4 taxas comparadas com o mercado (engajamento, salvamento, compartilhamento, comentário) e a cadência de posts por semana. Para as taxas, o "próximo patamar" é a referência de mercado quando você está abaixo dela, e 1,5× a referência quando já passou.

## Estados

- Tudo em "excelente": cartão único "Nenhum indicador abaixo do padrão neste recorte — mantenha o ritmo e suba a régua nas metas."
- Sem baseline interna para o mix: usa só as taxas vs. mercado e avisa na linha de contexto.
- Sem posts no período: reaproveita o vazio já existente da tela.

## Notas técnicas

- `src/lib/benchmark.ts`: novas funções puras `limiarProximaFaixa(valor, faixa)`, `prioridade(...)` e `recomendacoes({ linhas, baselines, taxas, porSemana })` retornando `Recomendacao[]` (`chave`, `rotulo`, `faixaAtual`, `proximaFaixa`, `atual`, `alvo`, `delta`, `deltaPct`, `prioridade`, `acao`, `casas`, `sufixo`). Mapa de ações por indicador como constante no mesmo arquivo.
- Novo `src/components/metricas/Recomendacoes.tsx` renderizando a lista; usa `pill-ruim/alerta/bom` e tokens existentes, animação só pelo `secao-entrada`.
- `Benchmark.tsx` chama `recomendacoes` em `useMemo` e insere o bloco entre os termômetros e a tabela de mercado; recebe `porSemana` que já é passado.
- Sem mudanças em hooks, server functions ou banco.

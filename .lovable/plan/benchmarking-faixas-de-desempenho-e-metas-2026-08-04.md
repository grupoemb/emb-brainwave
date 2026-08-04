# Benchmarking — faixas de desempenho e metas

Nova sub-aba **Benchmark** em `/metricas`, ao lado de Visão geral · Conteúdo · Ritmo · Contas. Só leitura das tabelas existentes; sem migrations, sem tabelas novas.

## De onde vêm as referências

Duas camadas, sempre rotuladas na tela para não confundir:

1. **Referência interna (dado real).** A tabela `metric_baselines` já tem `p25`, `median_value` e `p75` para os 6 indicadores (alcance, impressões, curtidas, comentários, salvamentos, compartilhamentos) nos 3 formatos do Instagram — confirmado no banco. Essas faixas viram as bandas de desempenho: abaixo de p25 = ruim, p25–mediana = regular, mediana–p75 = bom, acima de p75 = excelente.
2. **Referência de mercado (constante curada).** Uma tabela estática no código com médias públicas de Instagram por formato para taxa de engajamento, taxa de salvamento e taxa de compartilhamento (padrão de mercado tipo Social Blade / Rival IQ), com a fonte e o ano anotados em comentário. Fica num único arquivo fácil de atualizar.

Observação: não há contagem de seguidores em nenhuma tabela — `social_accounts.meta` só guarda o nome do secret. Por isso as métricas "por seguidor" típicas do Social Blade ficam de fora; tudo é medido sobre alcance, que é o dado que existe.

## O que a tela mostra

**1. Termômetro por indicador (grade de cartões)**
Para cada indicador do período filtrado, uma barra horizontal com as quatro faixas coloridas (ruim/regular/bom/excelente) e um marcador na posição atual, mais o valor e o rótulo da faixa. Indicadores: alcance médio por post, impressões médias, curtidas, comentários, salvamentos e compartilhamentos por post. Quando há vários formatos no recorte, a faixa é a média das baselines ponderada pela quantidade de posts de cada formato.

**2. Taxas vs. mercado**
Tabela compacta: taxa de engajamento, salvamento, compartilhamento e comentário — valor atual, referência de mercado, diferença em pontos percentuais e pill verde/coral. Cada linha diz de onde vem a referência.

**3. Metas sugeridas para o próximo ciclo**
Bloco com 4 a 6 metas geradas a partir do próprio histórico, cada uma com valor atual → alvo e a lógica em uma frase:
- Alcance médio por post: alvo = p75 da baseline do mix atual.
- Taxa de acerto (posts com rx ≥ 1): alvo = atual + 10 pontos, teto 70%.
- Fora da curva: alvo = pelo menos 1 a cada 10 posts publicados.
- Taxa de salvamento e compartilhamento: alvo = maior valor entre p75 interno e a referência de mercado.
- Cadência: alvo = mediana de posts/semana do melhor mês dos últimos 90 dias.
Cada meta traz barra de progresso (atual ÷ alvo) e o quanto falta em números absolutos.

**4. Faixa por conta**
Uma linha por conta conectada com a faixa em que ela caiu em alcance médio, engajamento e rx médio — leitura rápida de quem está acima ou abaixo do padrão da casa.

## Estados

- Sem baseline para o recorte: "Sem referência interna para este formato ainda — publique mais posts para calibrar a faixa"; a comparação com o mercado continua aparecendo.
- Sem posts no período: reaproveita o vazio já existente da tela.
- Carregamento: skeletons no padrão atual.

## Notas técnicas

- `src/lib/metricas.functions.ts`: incluir `p25` e `p75` no select de `metric_baselines` (hoje só traz `median_value`).
- Novo `src/lib/benchmark.ts`: constantes de referência de mercado, cálculo das faixas ponderadas pelo mix de formatos, classificação em faixa e geração das metas — funções puras, testáveis.
- Novos componentes em `src/components/metricas/`: `Benchmark.tsx`, `TermometroFaixa.tsx`, `TabelaMercado.tsx`, `MetasSugeridas.tsx`.
- `SubAbas.tsx` ganha a aba `benchmark`; `Metricas.tsx` renderiza o bloco. `useMetricas` expõe as baselines e o mix de formatos já filtrados.
- Cores só via tokens existentes (`bom`, `alerta`, `ruim`, `azure`, `cyan`); animação de entrada pelo `secao-entrada` já usado, sem loop.

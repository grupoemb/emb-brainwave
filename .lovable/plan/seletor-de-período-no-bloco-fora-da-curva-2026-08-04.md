# Seletor de período no bloco "Fora da curva"

Trocar a janela fixa de 7 dias por um seletor 7 / 14 / 30 dias no cabeçalho do bloco, com troca instantânea (sem recarregar a tela).

## Comportamento

- No cabeçalho do bloco "Fora da curva", ao lado do título, três gatilhos compactos: `7d`, `14d`, `30d`. Ativo com fundo azure a 14% e texto branco; inativos em muted com hover.
- O título passa a refletir a escolha: "Fora da curva — 7 dias / 14 dias / 30 dias".
- Ao trocar, o bloco recalcula os posts publicados na janela escolhida com `rx >= 2.0`, ordenados por rx decrescente (mesmo limite e mesma regra de mediana por formato já usados).
- Enquanto a nova janela carrega, o bloco mostra linhas de esqueleto no lugar da lista; o resto do painel não pisca.
- Vazio: "Nenhum post fora da curva nesta janela." com o período escolhido no título.
- O link "ver métricas" acompanha a escolha (abre /metricas com o mesmo número de dias).
- A escolha é um modo de leitura efêmero: não vai para a URL e volta a 7 dias ao recarregar.

## Detalhes técnicos

- `src/lib/painel.functions.ts`: `carregarPainel` ganha um campo opcional `diasOutliers` (7 | 14 | 30, padrão 7) no validador. A janela dos outliers passa a usar esse valor; os demais KPIs e o "Alcance 7d" continuam fixos em 7 dias, então a consulta de outliers vira uma busca própria de posts publicados na janela maior quando `diasOutliers > 7`, reaproveitando a mesma junção `post_metrics` (última leitura) + `metric_baselines`.
- `src/hooks/usePainel.ts`: aceita `diasOutliers` e inclui o valor na `queryKey`, com `placeholderData` para manter os dados anteriores visíveis durante a troca.
- `src/components/painel/Painel.tsx`: estado local `diasOutliers`, gatilhos de período no cabeçalho do bloco e esqueleto de lista durante o refetch.
- Somente leitura, sem migrations e sem novas tabelas; tudo continua filtrado por organização sob o RLS.

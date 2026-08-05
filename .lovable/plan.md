# Comparação lado a lado no drill-down

Hoje o painel lateral do drill-down mostra um único recorte (dia, formato, gancho, pilar, tema, intenção, conta ou célula do mapa de calor). A adição permite comparar dois lados com variação percentual entre eles.

## Como vai funcionar

No topo do painel, um seletor de comparação com três opções:

- **Desligado** — comportamento atual (um único bloco).
- **Período anterior** — o mesmo recorte no intervalo de comparação já configurado na barra de filtros (período anterior ou datas personalizadas).
- **Outro canal** — escolha de uma segunda conta; compara o mesmo recorte entre a conta A e a conta B dentro do período atual.

Quando ligado, o painel passa a mostrar:

```text
┌──────────────────────────────────────────────┐
│ Formato · Reels        [ Período anterior ▾ ] │
├──────────────────────┬───────────────────────┤
│ ATUAL  01/07–30/07   │ ANTERIOR 01/06–30/06  │
│ posts        12      │ posts        9   +33% │
│ alcance   84.2 mil   │ alcance   61.0 mil +38%│
│ alc. médio  7.016    │ alc. médio  6.777  +3%│
│ rx médio     1,42×   │ rx médio    1,10× +29%│
│ engajamento  4,1%    │ engajamento  3,4% +21%│
└──────────────────────┴───────────────────────┘
```

- Variação em verde (`bom`) quando sobe, vermelha (`ruim`) quando cai, cinza quando não há base de cálculo (`—`).
- Abaixo, a lista de posts ganha duas abas em chips: **Atual** e **Comparado / @conta**, para inspecionar cada lado sem poluir a tela estreita.
- Botão "Ver na tabela de posts" continua aplicando o recorte do lado atual.
- Se um dos lados não tiver posts, aparece um estado vazio curto no lugar da coluna ("Sem posts neste recorte no período comparado").
- Se a comparação de período estiver desligada na barra de filtros, a opção "Período anterior" aparece desabilitada com a dica "Ative a comparação no filtro de período".

Métricas comparadas: posts, alcance total, alcance médio, rx médio, engajamento e interações totais.

## Detalhes técnicos

1. `src/hooks/useMetricas.ts`: expor também `linhasComparadas` (as linhas montadas do intervalo comparado, hoje só usadas para `kpis`/`taxas`) e `contasDisponiveis` derivadas das linhas do período atual.
2. `src/lib/metricas.ts`: nova função `resumoRecorte(linhas, recorte)` retornando `{ posts, alcance, alcanceMedio, rxMedio, engajamento, interacoes }`, reaproveitada pelos dois lados; reutilizar `variacao()` já existente para os percentuais.
3. `src/components/metricas/PainelDrill.tsx`: novas props `linhasComparadas`, `rotuloComparacao`, `intervaloAtualRotulo`, `contas`; estado local do modo de comparação e da conta B; grade de duas colunas com linhas de métrica e badge de variação; chips de aba para a lista de posts.
4. `src/components/metricas/Metricas.tsx`: passar as novas props a partir do hook.
5. Sem mudanças de backend, tabelas ou queries novas — tudo é derivado dos dados já carregados.

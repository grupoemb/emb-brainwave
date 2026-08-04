# Tooltips explicativos no Painel

Adicionar dicas (tooltips) que explicam como cada indicador do painel é calculado, com foco em "rx", "consistência" e "fora da curva".

## O que o usuário vai ver

Um pequeno ícone de interrogação ao lado dos rótulos. Ao passar o mouse (ou tocar, no celular), aparece um cartão curto com a definição e a fórmula em linguagem simples.

Onde entra:

1. **Comparativo de contas** (podium por conta): Alcance no período, Alcance médio / post, Engajamento, rx médio, Consistência (rx ≥ 1), Fora da curva, Melhor post.
2. **Destaques do período**: Melhor alcance, Melhor engajamento, Maior rx, conta mais consistente.
3. **Bloco "Fora da curva — 7 dias"**: explicação do critério rx ≥ 2.0.
4. **Mini-KPIs** do topo (Agendados, Aguardando aprovação, Pautas novas, Alcance 7d, Contas conectadas): uma frase dizendo o que cada número conta.

## Textos (baseados no cálculo real do código)

- **rx**: alcance do post dividido pela mediana histórica daquele formato (reels, carrossel, etc.). rx 1.0 = na média do formato; rx 2.0 = o dobro.
- **rx médio**: média simples do rx de todos os posts da conta com leitura de métrica no período.
- **Consistência (rx ≥ 1)**: percentual dos posts da conta que ficaram igual ou acima da mediana do formato. Mede regularidade, não pico.
- **Fora da curva**: post com rx ≥ 2.0, ou seja, alcance de pelo menos 2× a mediana do formato.
- **Engajamento**: interações do período ÷ alcance do período × 100.
- **Alcance médio / post**: alcance total ÷ número de posts com leitura de alcance.
- **Alcance 7d**: soma do alcance das leituras dos últimos 7 dias.

## Detalhes técnicos

- Usar `@/components/ui/tooltip` (já no projeto); `Painel.tsx` já monta o provider — estender aos demais componentes do painel envolvidos.
- Criar um componente reutilizável `src/components/painel/Dica.tsx` (ícone `HelpCircle` 12px cor muted + `TooltipContent`), com `tabIndex` para acessibilidade por teclado e também `title` como fallback.
- Centralizar os textos num único mapa (`src/lib/glossario.ts`) para manter as definições iguais em todas as telas.
- Somente UI: nenhuma mudança em consultas, tabelas ou cálculos.

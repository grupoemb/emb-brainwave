/**
 * Textos únicos das dicas (tooltips) dos indicadores do painel.
 * Mantidos aqui para que a mesma definição apareça em todas as telas.
 */
export const GLOSSARIO = {
  rx: "rx = alcance do post ÷ mediana histórica daquele formato (reels, carrossel, etc.). rx 1,00× é a média do formato; 2,00× é o dobro.",
  rxMedio:
    "Média simples do rx de todos os posts da conta com leitura de métrica no período. Mostra se a conta costuma ficar acima ou abaixo da mediana do formato.",
  consistencia:
    "Percentual dos posts da conta que ficaram com rx ≥ 1, ou seja, iguais ou acima da mediana do formato. Mede regularidade, não pico.",
  foraDaCurva:
    "Post fora da curva = rx ≥ 2,00×, alcance de pelo menos 2× a mediana do formato. Aqui aparece quantos posts da conta bateram esse critério no período.",
  foraDaCurvaBloco:
    "Posts publicados na janela escolhida com rx ≥ 2,00×, ou seja, alcance de pelo menos 2× a mediana do formato. Ordenados do maior rx para o menor.",
  alcancePeriodo:
    "Soma do alcance das leituras dos posts da conta na janela escolhida. A variação compara com o período anterior de mesmo tamanho.",
  alcanceMedio:
    "Alcance total da conta ÷ número de posts com leitura de alcance no período.",
  engajamento:
    "Interações do período (curtidas, comentários, salvamentos, compartilhamentos) ÷ alcance do período × 100.",
  melhorPost: "Post da conta com o maior alcance registrado no período.",
  melhorAlcance: "Post com o maior alcance registrado na janela escolhida, entre todas as contas.",
  melhorEngajamento:
    "Post com a maior taxa de engajamento (interações ÷ alcance) na janela escolhida.",
  maiorRx:
    "Post com o maior rx da janela: o que mais superou a mediana histórica do próprio formato.",
  contaConsistente:
    "Conta com o maior percentual de posts com rx ≥ 1 no período — a que entrega acima da mediana com mais regularidade.",
  agendados: "Posts com data de publicação marcada para os próximos 7 dias.",
  aguardandoAprovacao: "Posts parados na coluna Revisão, esperando aprovação.",
  pautasNovas: "Sugestões de pauta com status Nova, ainda não transformadas em post.",
  alcance7d: "Soma do alcance de todas as leituras de métrica dos últimos 7 dias.",
  contasConectadas: "Contas de rede social com integração ativa nesta organização.",
} as const;

export type ChaveGlossario = keyof typeof GLOSSARIO;

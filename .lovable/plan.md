# Métricas 3.0 — dashboard visual com hierarquia

A tela de Métricas hoje é uma parede de cartões iguais: 10 KPIs do mesmo tamanho, mesma cor, mesma tipografia, e os gráficos aparecem só depois de muito scroll. A proposta é reorganizar tudo em camadas de leitura, com cor com significado e mais representações gráficas.

## 1. Hierarquia em três níveis

**Nível 1 — Cabeçalho de resultado (topo da aba Visão geral)**
Um bloco grande e escuro, largura total, com:
- Alcance total em número gigante com gradiente azure→cyan, variação vs. período anterior em pill colorida.
- Gráfico de área do alcance no período direto dentro do bloco (fundo do cartão, não em card separado).
- Três "medidores" à direita: taxa de engajamento, rx médio e consistência — cada um em arco/anel de progresso colorido pela faixa (ruim / alerta / bom), não como texto solto.

**Nível 2 — KPIs agrupados por família, não em grade única**
Em vez de 10 cartões iguais, três grupos com título e cor de acento própria:
- Alcance (azure): alcance, impressões, impressões por post.
- Interação (cyan): interações, curtidas, comentários, salvamentos, compartilhamentos — cada um com micro-barra mostrando participação no total de interações.
- Eficiência (dourado): rx médio, fora da curva, posts publicados, taxa de acerto.
Cada cartão ganha ícone próprio, sparkline de 7 pontos, e a pill de variação passa a ter seta e cor semântica. Cartão principal de cada grupo fica maior (span 2) — hierarquia dentro do grupo.

**Nível 3 — Detalhe e tabelas** permanece nas sub-abas.

## 2. Mais gráficos e infográficos

- **Composição das interações**: barra empilhada horizontal (curtidas / comentários / salvamentos / compartilhamentos) com legenda percentual — substitui quatro cartões numéricos soltos.
- **Radar de desempenho**: gráfico de radar (Recharts) com 5 eixos (alcance, engajamento, salvamento, compartilhamento, consistência) comparando período atual vs. anterior ou vs. mediana de mercado.
- **Funil de interação** redesenhado: etapas em trapézios com largura proporcional e taxa de conversão entre etapas.
- **Mapa de calor** com escala de cor real (azul→cyan→dourado) em vez de opacidade única, com rótulos de dia/hora legíveis e destaque do melhor horário.
- **Barras por dimensão** (formato, gancho, pilar, tema) coloridas pela faixa de rx com linha de referência em 1,00× e rótulo de nº de posts.
- **Donut de formatos** com centro informativo (total de posts) e legenda clicável que filtra a tabela.

## 3. Cor com significado (fim do "tudo da mesma cor")

Regra fixa aplicada em toda a tela:
- azure = volume/alcance, cyan = interação, dourado = eficiência/destaque, bom/alerta/ruim = faixas de desempenho.
- Cartões ganham uma faixa superior de 2px na cor da família e ícone em pastilha colorida a 12%.
- Números fora da curva e recordes recebem realce dourado com ícone flame (padrão já existente).
- Nada de cor decorativa: se está colorido, comunica faixa ou família.

## 4. Navegação mais intuitiva

- Sub-abas viram uma barra segmentada maior, com ícone + rótulo e contador quando aplicável (ex.: Conteúdo · 26).
- Filtros ficam em barra fixa (sticky) abaixo do cabeçalho ao rolar, mostrando resumo do recorte ativo.
- Cada bloco ganha título + uma linha de leitura ("o que isso quer dizer"), então o usuário entende sem tooltip.
- Estados vazios por bloco, em vez de a tela inteira ficar vazia.

## Detalhes técnicos

- Novos componentes em `src/components/metricas/`: `PainelResultado.tsx` (nível 1), `GrupoKpis.tsx`, `BarraComposicao.tsx`, `RadarDesempenho.tsx`, `Medidor.tsx`.
- Reescrita visual de `CartaoKpi.tsx` (variantes de família/tamanho, sparkline, faixa de cor), `SubAbas.tsx`, `FunilInteracao.tsx`, `MapaDeCalor.tsx`, `BarrasDimensao.tsx`, `DonutFormatos.tsx`, `GradeTaxas.tsx` e reorganização de `Metricas.tsx`.
- Tokens de acento por família e utilitários de faixa adicionados em `src/styles.css` (reaproveitando `--azure`, `--cyan`, `--dourado`, `--bom/alerta/ruim`; sem cores hardcoded nos componentes).
- Recharts já instalado; radar e área usam os mesmos dados já retornados por `useMetricas`/`src/lib/metricas.ts`.
- **Sem mudança de dados**: nenhuma tabela, migration ou edge function nova. Cálculos derivados (participação por interação, eixos do radar) são feitos no cliente a partir do que já é carregado.
- Animações respeitam `prefers-reduced-motion` e seguem a entrada única já usada em `Revelar`.

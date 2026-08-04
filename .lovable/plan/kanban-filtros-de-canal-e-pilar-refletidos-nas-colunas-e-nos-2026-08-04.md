# Kanban: filtros de Canal e Pilar refletidos nas colunas e nos cards

Hoje o Kanban já calcula a lista filtrada por canal e pilar, mas a visualização não deixa isso claro: todas as colunas continuam sendo desenhadas mesmo quando ficam sem nenhum card no recorte, as contagens no cabeçalho não comunicam que são do filtro, e a mensagem de vazio é sempre a genérica "Nenhuma ideia por aqui. Peça pautas ao cérebro." — que não faz sentido quando o vazio é causado por um filtro.

## O que muda

1. **Colunas respondem ao recorte**
   - Com filtro ativo (canal e/ou pilar), colunas sem nenhum card no recorte aparecem em estado esmaecido e compacto, com o texto "sem cards neste recorte" no lugar da lista — continuam visíveis para não quebrar o arraste entre etapas.
   - O contador do cabeçalho de cada coluna passa a mostrar o número no recorte e, quando há filtro, também o total da coluna (ex.: "3 de 11").

2. **Cards exibidos**
   - Mantém a filtragem atual por `channel` e `pillar_id`, aplicada antes do agrupamento por status (inclusive na coluna "Publicado" e no "Ver todos").

3. **Vazio específico do filtro**
   - Quando o recorte não retorna nenhum card em nenhuma coluna, exibe o componente compartilhado `VazioFiltrado` (mesmo padrão de Métricas, Calendário e Pautas), com:
     - mensagem: "Nenhum card corresponde ao filtro."
     - detalhe descrevendo o recorte ativo (ex.: "Canal Instagram · Pilar Bastidores").
     - ação "limpar filtros" que zera canal e pilar.
   - A mensagem "Nenhuma ideia por aqui / Gerar pautas" só aparece quando não há filtro ativo e o fluxo está realmente vazio.
   - Quando existe foco de coluna vindo do painel e o filtro derruba os cards daquela coluna, a mensagem cita o filtro e oferece as duas saídas: limpar filtros e ver todo o fluxo.

4. **Resumo do recorte**
   - A linha de contagem no topo passa a descrever o recorte por extenso ao lado de "X de Y cards", com botão discreto para limpar quando algum filtro estiver ativo.

## Detalhes técnicos

- Alterações concentradas em `src/components/conteudo/Kanban.tsx`.
- Reuso de `VazioFiltrado` (`src/components/filtros/VazioFiltrado.tsx`) — sem novo componente.
- Rótulos vindos de `CANAIS` (`src/lib/conteudo.ts`) e de `pilarPorId` do hook `usePilares` para montar o texto do recorte.
- Nenhuma mudança de consulta, schema ou RLS: a filtragem continua no cliente sobre os posts já carregados por organização.

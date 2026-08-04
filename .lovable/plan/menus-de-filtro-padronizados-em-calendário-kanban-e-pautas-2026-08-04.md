# Menus de filtro padronizados em Calendário, Kanban e Pautas

Hoje só Métricas tem os gatilhos compactos com painel suspenso. Calendário e Pautas ainda usam fileiras de chips que rolam na horizontal (no Calendário, canais, pilares e etapas ficam todos na mesma linha), e o Kanban não tem filtro nenhum. A ideia é extrair o padrão de Métricas para um componente compartilhado e aplicá-lo nas três telas.

## Componente compartilhado

Novo `src/components/filtros/MenuFiltro.tsx` com as peças que hoje vivem dentro de `FiltrosMetricas.tsx`:

- `GatilhoFiltro` — botão compacto com rótulo em maiúsculas, valor selecionado, chevron que gira, e destaque em azure quando o filtro está fora do padrão.
- `ItemOpcao` — linha do painel com check à direita, ponto de cor opcional e contagem opcional entre parênteses.
- `PainelFiltro` — o popover estilizado (fundo `--card`, borda `--line`, raio .7rem, sombra do cartão).
- `MenuFiltro` — junta gatilho + painel + estado de abertura, recebendo uma lista de opções `{ valor, rotulo, cor?, contagem? }` e fechando sozinho ao escolher.

`FiltrosMetricas.tsx` passa a importar essas peças em vez de defini-las localmente — comportamento e aparência de Métricas ficam idênticos.

## Calendário

A fileira "Tudo / canais / pilares / etapas" vira três gatilhos, ao lado do seletor Mês/Semana:

```text
[ Mês | Semana ]   [ Canal · Todos v ] [ Pilar · Todos v ] [ Etapa · Todas v ]      < agosto de 2026 >
```

Mês/Semana continua como par de chips (são duas opções, alternância direta). Cada menu tem "Todos" no topo, separador e a lista; pilares mostram o ponto colorido. Um link "limpar filtros" aparece à direita apenas quando algum recorte está aplicado.

## Kanban

Ganha a mesma barra, com dois menus, na linha que hoje só tem a contagem e o botão Novo card:

```text
12 cards no fluxo   [ Canal · Todos v ] [ Pilar · Todos v ]        [ + Novo card ]
```

O filtro é aplicado em memória sobre os posts já carregados, antes do agrupamento por coluna, e a contagem do topo passa a refletir o recorte ("8 de 12 cards"). Nada muda no arrastar-e-soltar nem nas mutações.

## Pautas

A busca por texto continua como está (campo com lupa). As três fileiras de chips viram três gatilhos, com as contagens dentro do painel:

```text
[ buscar por título ou pelo porquê…            ]
[ Status · Novas (7) v ] [ Tipo · Todos (23) v ] [ Pilar · Todos v ]    23 pautas · Limpar filtros
```

Cada opção mostra o rótulo e a contagem; o valor no gatilho traz a contagem do filtro ativo. O rodapé com total e "Limpar filtros" continua igual.

## Detalhes técnicos

- Criar `src/components/filtros/MenuFiltro.tsx`; refatorar `src/components/metricas/FiltrosMetricas.tsx` para consumi-lo (o caso Comparar/datas personalizadas segue usando `PainelFiltro` diretamente, pois tem conteúdo próprio).
- `Calendario.tsx`: remover o `Chip` de filtro (mantendo-o só para Mês/Semana) e trocar as três listas por `MenuFiltro`; estados `canal`, `pilar`, `status` permanecem em `useState`, sem mudança em URL ou dados.
- `Kanban.tsx`: adicionar `canal` e `pilar` em `useState`, filtrar `posts` antes de montar `porStatus`, e renderizar dois `MenuFiltro` na barra superior. O parâmetro `foco` vindo do painel continua funcionando.
- `FiltrosPautas.tsx`: substituir as fileiras de `Chip` por `MenuFiltro`, mantendo as mesmas props (`filtros`, `definir`, `limpar`, `contagemStatus`, `contagemTipo`, `pilares`) e os search params atuais; o `Chip` exportado só é removido se ninguém mais o importar.
- Sem mudanças em hooks, server functions, banco ou tokens de design.

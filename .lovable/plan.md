# Navegação das Métricas mais clara

Hoje a tela `/metricas` tem cinco abas (Visão geral, Conteúdo, Ritmo & horários, Contas, Benchmark) que vivem só na memória do componente: ao recarregar a página ou voltar de um post, a aba volta para "Visão geral" e não dá para compartilhar link de uma aba específica. Também não existe trilha (breadcrumb) na tela, e quando não há dados aparece apenas um cartão cinza com uma frase — sem ícone, sem marca, sem próximo passo.

## O que muda

### 1. Abas mais claras e com endereço próprio
- A aba escolhida passa a ficar na URL (`/metricas?aba=ritmo`), então o link pode ser compartilhado, o botão voltar do navegador funciona e a aba se mantém ao recarregar.
- Cada aba ganha uma linha curta de contexto logo abaixo da barra ("o que você vê aqui"), para o usuário saber o que esperar antes de ler os gráficos.
- Contadores nas abas passam a existir em todas que têm volume (conteúdo, contas, benchmark), e a barra fica com rolagem horizontal suave no celular em vez de quebrar em duas linhas.
- A barra de abas acompanha os filtros fixos no topo ao rolar, para não se perder o contexto de período.

### 2. Trilha (breadcrumb)
- Trilha no topo da tela: `Painel › Métricas › <aba atual>`, com os níveis anteriores clicáveis.
- Quando a pessoa chega vinda do Painel, a trilha mostra a origem e mantém o botão de limpar o recorte já existente.
- A trilha some do caminho de leitura quando não agrega (tela carregando), para não piscar.

### 3. Estados vazios bonitos
- O cartão cinza atual é trocado pelo componente de estado vazio padrão do app (ícone, marca B7, título, descrição e ação).
- Estados distintos, cada um com a ação certa:
  - Nenhuma coleta ainda: explica que as contas ainda não trouxeram leitura e leva para Ajustes › Contas.
  - Período sem posts: sugere ampliar para 30/90 dias com botão direto.
  - Filtro de conta/pilar sem resultado: usa a variante "filtro" com botão "limpar recortes".
  - Erro: mantém a variante de erro já existente, com "tentar novamente".
- Cada aba passa a ter seu próprio vazio quando só ela está sem dado (ex.: Ritmo sem horários suficientes, Benchmark sem base de mercado), em vez de mostrar gráficos zerados.

## Detalhes técnicos

- `src/routes/_authenticated/metricas.tsx`: acrescentar `aba` ao schema Zod de search (`fallback` para `"geral"`), validando contra os valores de `Aba`.
- `src/components/metricas/Metricas.tsx`: trocar `useState<Aba>` por leitura de `useSearch` + `navigate({ search: prev => ({...prev, aba}) , replace: true })`; substituir o bloco `semPosts` por `EstadoVazio` com as variantes acima; envolver cada aba em um guard de vazio próprio.
- `src/components/metricas/SubAbas.tsx`: adicionar descrição por aba, `overflow-x-auto` com `snap`, e manter o padrão visual atual (azure ativo).
- Novo `src/components/metricas/TrilhaMetricas.tsx` seguindo o padrão de `TrilhaPost.tsx` (Link + ChevronRight, texto xs, `secao-entrada`).
- Reuso de `EstadoVazio` (variantes `vazio`/`erro`/`filtro`) e `VazioFiltrado` — nenhum componente novo de vazio.
- Sem mudanças de dados: nenhuma tabela, função ou consulta nova; segue tudo por `useMetricas` filtrando por organização.

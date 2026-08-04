# Refinamento visual e de UX em todo o app

Objetivo: elevar o nível de UI/UX de todas as abas mantendo a identidade atual (tema escuro azure/cyan, Geist + Montserrat). Nada de mudança de regra de negócio, banco ou queries — só camada visual, hierarquia e interação.

## 1. Base do design system (src/styles.css)

Hoje só existem `.cartao`, `.numero`, `.rotulo`, `.grad`, `.btn`, `.pill*`. Isso faz cada tela improvisar espaçamento e superfícies. Adicionar:

- Escala de superfícies: `.cartao` (padrão), `.cartao-alto` (destaque, borda `--line-forte` + halo azure sutil), `.cartao-plano` (sem sombra, para listas internas).
- Escala tipográfica utilitária: `.titulo-pagina`, `.titulo-secao`, `.legenda` — assim todas as telas usam os mesmos tamanhos/pesos.
- Estados: `.skeleton` (shimmer discreto, respeitando reduced-motion), `.vazio` (estado vazio padrão com ícone + frase + ação).
- Interação: `.interativo` (hover eleva 1px, borda clareia, transição 160ms), `.foco-anel` consistente.
- Densidade de tabela: `.tabela` com header sticky, zebra sutil, linhas 44px, números em `.numero`.
- Ajuste de tokens: adicionar `--sombra-1/2`, `--halo-azure` e `--line-suave` para reduzir o excesso de bordas duras.

## 2. Casca do app (AppShell)

- Sidebar: agrupar navegação em seções com `.rotulo` ("Operação": Painel, Calendário, Kanban, Criar · "Inteligência": Métricas, Pautas, Cérebro, Reels Radar · "Config": Ajustes). Item ativo ganha barra indicadora azure à esquerda + ícone colorido, em vez de só fundo.
- Rodapé da sidebar com bloco do usuário (avatar + nome + sair), liberando o header.
- Header: título da página + subtítulo curto por rota, breadcrumb quando houver contexto, e slot à direita para ações da própria tela (filtros/CTA) — hoje cada tela empurra isso para dentro do conteúdo.
- Conteúdo: espaçamento vertical padronizado (`space-y-5`), largura máxima já existente mantida.

## 3. Padrões repetidos em todas as abas

- **Cabeçalho de tela** único: título, uma linha de contexto, ações à direita. Aplicar em Painel, Calendário, Kanban, Criar, Métricas, Pautas, Cérebro, Radar, Ajustes.
- **Carregamento**: substituir textos "Carregando…" por skeletons com a forma do conteúdo final.
- **Estados vazios**: componente único com ícone, frase clara e botão de ação (ex.: "Nenhum card aqui — Criar post").
- **Barra de filtros**: reaproveitar o `MenuFiltro` existente em todas as telas que filtram, com chips de filtro ativo removíveis e botão "limpar".
- **Números**: sempre `.numero` + tabular, com variação em pill colorida (verde/âmbar/vermelho) e seta.

## 4. Ajustes por aba

- **Painel (/)**: reorganizar em grid claro — faixa de KPIs no topo (cards maiores, sparkline no rodapé de cada), depois duas colunas (agenda + fora da curva), depois comparativo de contas. Reduzir ruído de bordas.
- **Calendário**: células com altura uniforme, chips de post por canal com cor de pilar, hoje destacado, contagem por dia, coluna "sem data" como painel colapsável.
- **Kanban**: colunas com header sticky (nome + contagem + cor), cards mais legíveis (título 2 linhas, canal, pilar, data), feedback de drag mais claro (placeholder tracejado azure).
- **Criar**: layout em duas colunas (briefing à esquerda, resultado à direita) com resultado em card destacado e ações fixas no rodapé.
- **Métricas**: espaçamento entre sub-abas e blocos, legendas dos gráficos padronizadas, tooltip único de gráfico, alinhamento dos KPIs.
- **Pautas**: cards em grid com trilha do loop como stepper horizontal enxuto.
- **Cérebro**: playbook em cards de duas colunas, listas com marcadores discretos.
- **Reels Radar**: grid de itens com miniatura, hierarquia clara entre insight e lista.
- **Ajustes**: chips de aba com indicador deslizante, formulários em cartões com título e descrição.
- **/post/:id**: coluna lateral com abas alinhadas ao novo padrão.

## 5. Responsivo e acessibilidade

- Linhas com texto + widget usando grid `minmax(0,1fr) auto` + `min-w-0`/`shrink-0` (evita quebra em telas estreitas como a atual de 731px).
- Alvos de toque ≥ 44px na navegação e botões de ícone; `aria-label` em todos os botões só de ícone.
- Contraste: trocar usos de texto `muted` sobre `card` em informação essencial por `corpo`.

## 6. Movimento

Manter a regra atual: entrada única fade + 14px, 0.42s, stagger 45ms, sem loop/parallax. Adicionar apenas micro-transições de hover/press (≤180ms) e `prefers-reduced-motion` desligando tudo.

## Notas técnicas

- Alterações concentradas em `src/styles.css`, `src/components/AppShell.tsx`, um novo `src/components/ui/CabecalhoTela.tsx`, `EstadoVazio.tsx` e `Esqueleto.tsx`, e ajustes de classe nos componentes de cada módulo.
- Nenhuma query, hook de dados, tabela ou edge function é alterada.
- Execução em ordem: tokens/classes → casca → componentes compartilhados → abas, uma a uma.

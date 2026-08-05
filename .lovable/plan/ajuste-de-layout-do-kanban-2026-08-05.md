# Ajuste de layout do Kanban

Ajustar apenas as classes de layout em `src/components/conteudo/Kanban.tsx`, sem alterar lógica, estado, hooks ou comportamentos.

## Mudanças

1. **Container das colunas** (div com `secao-entrada flex gap-3 overflow-x-auto pb-2`):
   - Nova classe: `secao-entrada flex items-start gap-3 overflow-x-auto pb-3 max-h-[calc(100dvh-12rem)]`
   - Objetivo: limitar a altura do board à viewport para manter a barra de rolagem horizontal visível.

2. **Cada coluna `<section>`** (atualmente `w-[272px] shrink-0 self-start rounded-xl bg-bg2 p-3 ...`):
   - Substituir `self-start` por `flex flex-col max-h-full`
   - Manter `w-[272px]` e `shrink-0`.
   - Objetivo: permitir que a coluna ocupe toda a altura do container e role internamente.

3. **Header da coluna** (`<header className="mb-3 flex items-center gap-2">`):
   - Acrescentar `shrink-0`.
   - Objetivo: manter o título fixo no topo da coluna.

4. **Lista de cards** (div `flex flex-col gap-[10px]`):
   - Nova classe: `flex flex-col gap-[10px] overflow-y-auto min-h-0 pr-1 -mr-1`
   - Objetivo: ativar rolagem vertical independente dentro de cada coluna.

## Escopo

- Apenas `src/components/conteudo/Kanban.tsx`.
- Nenhuma alteração em hooks, server functions, queries, toasts, drag-and-drop ou estados.
- Visual e estilo existentes permanecem inalterados.

# Corrigir o menu do formulário de metas e incluir "Novos seguidores"

## 1. Menu suspenso transparente (sobreposição)

Causa confirmada: os menus do Radix (`SelectContent`) usam as cores `bg-popover` / `text-popover-foreground` / `bg-accent`, mas o tema em `src/styles.css` (bloco `@theme inline`) não define nenhum token `--color-popover*` nem `--color-accent*`. Sem valor, o fundo fica transparente e a lista aparece "por cima" do diálogo sem separação.

Correção: adicionar ao tema os tokens que faltam, apontando para as cores já existentes do projeto:
- `--color-popover: var(--card-2)`, `--color-popover-foreground: var(--txt)`
- `--color-accent: rgba(0,164,255,.14)`, `--color-accent-foreground: var(--txt)`
- `--color-card` / `--color-card-foreground` equivalentes para os demais componentes shadcn

Nenhuma mudança de layout ou de componente shadcn é necessária — apenas os tokens de cor. O menu passa a ter fundo sólido, borda sutil e sombra, sem sobrepor visualmente o conteúdo do diálogo.

## 2. Meta de "Novos seguidores"

Hoje a lista de métricas traz apenas "Seguidores". A escolha entre ganhar N novos e chegar a N total só aparece depois, em um segundo bloco ("Tipo de meta"), o que fez a opção de novos seguidores parecer inexistente.

Correção no formulário (`src/components/metas/DialogMeta.tsx` + rótulos em `src/lib/metas.ts`):
- A lista de métricas passa a mostrar duas entradas explícitas no topo:
  - **Novos seguidores** (ganho no período) → grava `metric: followers`, `mode: increase`
  - **Seguidores (total)** (chegar a N) → grava `metric: followers`, `mode: absolute`
- O bloco "Tipo de meta" continua existindo para ajuste fino, já pré-selecionado conforme a escolha acima.
- Ao editar uma meta existente, a seleção reflete o modo salvo.
- Rótulo/exemplo de alvo adaptado ("Ex.: 2000 novos seguidores").

Sem alterações no banco: continua usando a tabela `goals` e a função `goals_overview` já existentes.

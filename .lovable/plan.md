# Breadcrumb e "Voltar" na tela do post

Hoje a tela `/post/:id` abre direto no cabeçalho com o título editável, sem nenhum caminho de volta (só existe um link para o Kanban no estado "Post não encontrado"). Quem chega pelo bloco "Fora da curva" do Painel precisa usar o botão do navegador.

## O que será adicionado

Uma linha discreta acima do cartão de cabeçalho do post, com:

- **Botão "Voltar"** (ícone de seta + texto, estilo `.btn` compacto) que leva à tela de origem.
- **Breadcrumb**: `Origem › Post` — por exemplo `Painel › Post`, `Kanban › Post`, `Calendário › Post`, `Métricas › Post`. O nome da origem é um link; "Post" fica em texto muted.

## Como a origem é detectada

O link de cada lista passa a incluir um parâmetro de origem na URL (`?origem=painel`, `kanban`, `calendario`, `metricas`). A tela do post lê esse parâmetro e monta o breadcrumb e o destino do "Voltar". Sem parâmetro (link colado, favorito), o padrão é **Kanban**.

Como o pedido é sobre o bloco "Fora da curva", o Painel também mantém a janela escolhida (7/14/30 dias) ao voltar, para o usuário reencontrar a mesma lista.

## Detalhes técnicos

- `src/routes/_authenticated/post.$id.tsx`: adicionar `validateSearch` com Zod (`origem` enum com fallback `"kanban"`, e `dias` opcional para o retorno ao Painel).
- Novo `src/components/conteudo/TrilhaPost.tsx`: breadcrumb + botão voltar, usando `<Link to=... >` do TanStack Router (nada de `history.back()`), tokens existentes (`text-muted`, `text-azureClaro`, `.btn`) e `ChevronLeft`/`ChevronRight` do lucide em 14px.
- `src/components/conteudo/PostDetalhe.tsx`: renderizar `TrilhaPost` como primeiro item da coluna principal, dentro do `Revelar` (mesma animação de entrada em cascata).
- Origem propagada nos links existentes para `/post/$id`: `Painel.tsx` (bloco "Fora da curva" e "Próximos agendamentos"), `Kanban.tsx`, `Calendario.tsx` e a tabela de `Metricas`.
- Sem mudanças de backend, banco ou RLS.

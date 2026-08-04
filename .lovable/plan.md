# Tempo real no Kanban e no Calendário

Objetivo: quando alguém arrasta um card ou cria um card, a tela reflete a mudança na hora — e a mudança aparece também para os outros usuários conectados, com avisos discretos de sucesso e de falha.

## O que muda para quem usa

- Arrastar um card no Kanban ou no Calendário move o card imediatamente na tela; se o servidor recusar (por exemplo, post sem aprovação), o card volta sozinho para o lugar de origem e aparece um aviso explicando o motivo.
- Criar um card faz o card surgir na coluna "Ideia" na hora, sem esperar recarregar.
- Alterações feitas por outra pessoa da equipe aparecem sozinhas nas duas telas, sem precisar atualizar a página.
- Avisos discretos, curtos e em português:
  - sucesso: "Movido para Roteiro", "Agendado para 12/08", "Desagendado", "Card criado"
  - falha: mensagem do erro, ou texto padrão "Não foi possível salvar"
  - o aviso de "post ainda não aprovado" continua como está hoje (âmbar), sem duplicar com um segundo aviso de erro.

## Ajuste no banco (único comando, autorizado)

Uma linha para ligar a transmissão ao vivo da tabela de posts — nenhuma tabela, coluna ou política nova:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
```

O RLS existente continua valendo: cada usuário só recebe eventos dos posts da própria organização.

## Detalhes técnicos

1. `src/hooks/useRealtimePosts.ts` (novo)
   - `useEffect` com `supabase.channel("posts-org-<id>")` escutando `postgres_changes` (`event: "*"`, `schema: public`, `table: posts`, `filter: organization_id=eq.<id>`).
   - Em cada evento, `queryClient.invalidateQueries({ queryKey: ["posts", organizationId] })`.
   - Cleanup obrigatório com `supabase.removeChannel(channel)`; canal só é criado quando há `organizationId`.

2. `src/hooks/useConteudo.ts`
   - `useMoverStatus`, `useAgendar` e `useCriarPost` ganham atualização otimista: `onMutate` cancela queries de `["posts", orgId]`, guarda o snapshot e escreve o novo estado no cache; `onError` restaura o snapshot; `onSettled` invalida.
   - Toasts ficam nos componentes chamadores (já usam `mutateAsync` em `try/catch`), para não duplicar mensagens.
   - `usePosts` recebe `refetchOnWindowFocus: true` como rede de segurança.

3. `src/components/conteudo/Kanban.tsx`
   - Chama `useRealtimePosts()`.
   - Após mover com sucesso: `toast.success("Movido para <coluna>")`; recusa por aprovação mantém o toast âmbar atual e não dispara toast de erro.

4. `src/components/conteudo/Calendario.tsx`
   - Chama `useRealtimePosts()`.
   - Sucesso ao agendar/desagendar: toast curto com a data formatada em pt-BR; erro mantém `toast.error`.

5. `src/components/conteudo/NovoCardDialog.tsx`
   - Sucesso: `toast.success("Card criado")`; erro segue como está.

`<Toaster />` já está montado no root; nada a fazer lá.

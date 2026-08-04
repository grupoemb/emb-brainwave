# Tela completa do post (/post/:id)

Nova página de detalhe do post, aberta ao clicar em cards do Kanban e pills do Calendário. O dialog provisório do Calendário é removido.

## Navegação

- Nova rota protegida `/_authenticated/post/$id` (URL `/post/<id>`).
- Cards do Kanban e pills/itens do Calendário passam a navegar para essa rota.
- O dialog de preview do Calendário é removido; o "Novo card" continua como está.
- Post inexistente (ou sem acesso pelo RLS): cartão de erro com borda esquerda coral de 4px e link de volta ao Kanban.

## Coluna principal (2/3)

**Cabeçalho**
- Título editável inline (text-lg font-bold), salvo pelo autosave.
- Pill de status na cor da coluna do Kanban, ícone do canal.
- Indicador de frescor "salvo há Xs" com ícone que gira apenas durante o salvamento e completa a volta antes de parar.

**Editor do corpo**
- Textarea grande ligada a `posts.body`, autosave com debounce de 2s.
- A cada autosave em que o corpo mudou e a versão mais recente tiver mais de 3 minutos, grava snapshot em `post_versions` (`version_no` incremental, `created_by` = usuário logado).
- Botão "Salvar versão" força snapshot imediato.

**Campos (grade de 2 colunas, mesmo autosave)**
- Canal, formato, gancho (hook), pilar (select de `content_pillars` com dot da cor), agendamento (`scheduled_for`, datetime no fuso America/Sao_Paulo) e CTA (gravado em `meta.cta`, preservando o restante do `meta`).

**Mídia**
- Dropzone que envia arquivos ao bucket privado `post-assets` no caminho `{organization_id}/{post_id}/{nome-do-arquivo}`.
- Registro em `post_assets` com `kind` derivado do mime: image | video | pdf (outros mimes recebem "other").
- Grid de previews com signed URL: imagem em thumb, vídeo em player, PDF como cartão com nome do arquivo.
- Botão de remover em cada item: apaga do storage e da tabela.
- Erro de upload mostra a mensagem real retornada pelo Supabase no toast.

## Coluna lateral (1/3) — duas abas

**Aprovação**
- Estado atual = decisão mais recente como pill: `approved` (pill-bom "Aprovado"), `changes_requested` (pill-alerta "Alterações"), `rejected` (pill-ruim "Rejeitado"), sem registro = pill neutra "Pendente".
- Se o usuário puder revisar: botões "Aprovar" (.btn-primario), "Pedir alteração" e "Rejeitar", com campo de nota opcional; grava em `approvals` com `reviewer_id` = usuário logado.
- Trilha completa abaixo: avatar de iniciais + decisão + nota + data em text-xs.

**Versões**
- Lista de `post_versions` (v3, v2, v1…) com autor e data.
- Clicar abre o texto da versão em leitura, com botão "Restaurar": copia o texto para `posts.body` e cria uma nova versão registrando a restauração.

## Regras

- Mudança de status para `approved`/`scheduled` continua exigindo aprovação positiva (mesma regra do Kanban).
- Post com `status = published` e `meta.source_handle` preenchido é importado do Instagram: corpo, título e demais campos em somente leitura com banner discreto "Post publicado — importado do Instagram"; pilar e gancho seguem editáveis.
- Visual apoiado na fundação existente (.cartao, .numero, .rotulo, pills, entrada animada, prefers-reduced-motion).
- Nenhuma tabela, bucket ou migration nova; todo acesso respeita o RLS existente.

## Detalhes técnicos

- Server functions novas em `src/lib/conteudo.functions.ts` (todas com `requireSupabaseAuth`, RLS como usuário): obter post completo (post + pilar + meta), atualizar campos do post, listar/criar versões, listar/criar aprovações, listar assets, registrar e remover asset, e gerar signed URLs.
- Upload e remoção do arquivo no Storage acontecem no navegador com o cliente Supabase autenticado (as policies do bucket já permitem); o registro em `post_assets` passa por server function.
- `useOrg` ganha `canReview`, derivado do papel na organização (owner, admin, editor, reviewer).
- Novo hook `usePost(id)` com React Query, autosave por debounce e mutations otimistas; o realtime de posts já existente continua invalidando o cache.
- `version_no` calculado como maior versão existente + 1, com nova tentativa em caso de corrida.
- Datas em `America/Sao_Paulo` seguindo o mesmo utilitário já usado no Calendário.
- `head()` próprio da rota com título e descrição específicos do detalhe do post.

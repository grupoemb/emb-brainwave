# /ajustes completo — 5 abas

Substituir a tela atual de Ajustes (hoje só perfil + lista simples de contas) por uma tela com chips de navegação: **Perfil · Equipe · Contas · Marca & Pilares · Templates de IA**. Tudo lê e escreve nas tabelas existentes, sempre com o RLS do banco decidindo o que passa; a interface apenas reflete as permissões.

## Perfil (todos)
- Editar o próprio nome, ver o email da sessão e o papel como pill.
- Botão salvar em `.btn-primario`, com mensagem de sucesso/erro.
- Mantém o campo de avatar já existente.

## Equipe
- Cartão informativo no topo: "Novos membros: criam conta na tela de login e informam o código de acesso da equipe (o administrador tem o código)." O código nunca aparece na interface.
- Lista de membros com avatar de iniciais, nome e papel.
- Se o usuário for owner/admin: seletor de papel por membro (owner, admin, editor, writer, reviewer, viewer) e botão discreto de remover, com diálogo de confirmação.
- Demais papéis: lista somente leitura.

## Contas
- Lista de contas sociais: ícone do canal, @handle, pill de status ("Conectada" quando há data de conexão, senão "Aguardando token") e data da última coleta.
- Admin pode ligar/desligar a conta com um switch.
- Nota fixa: "Tokens e coleta são gerenciados pelo backend; novas contas são conectadas pelo administrador."

## Marca & Pilares
- Formulário do perfil de marca com voz, público e diretrizes (campos de texto longos) e o aviso "Este texto alimenta TODA geração de conteúdo da IA." O playbook não é editável aqui.
- Pilares: lista com bolinha colorida, nome e descrição; adicionar, editar e remover em diálogo, com paleta fixa de 6 cores.
- Admin/editor editam; os demais veem em modo leitura.

## Templates de IA (admin/editor)
- Lista de templates com tipo, título e pill ativo/inativo.
- Ao clicar, abre o editor: textarea grande do prompt em fonte monoespaçada pequena e switch de ativo.
- Ao salvar, a versão é incrementada.
- Aviso: "Estes templates definem como a IA escreve cada tipo de peça no Studio Criar."

## Comportamento geral
- Entrada animada padrão (fade + subida, stagger), respeitando redução de movimento.
- Estados vazios com frase própria em cada aba; esqueletos durante o carregamento.
- Toasts discretos de sucesso/falha nas ações de escrita.
- O link do painel (`?secao=contas&origem=painel`) passa a abrir direto na aba Contas, mantendo a faixa de contexto.

## Detalhes técnicos
- `useOrg` ganha `isAdmin` (owner/admin) e `podeEditarMarca` (owner/admin/editor), derivados do papel já retornado.
- Novo `src/lib/ajustes.functions.ts` com server functions sob `requireSupabaseAuth`: membros da organização (join `organization_members` + `profiles`), atualizar papel, remover membro, contas sociais com última coleta (max `captured_at` de `post_metrics` via `posts.meta->>source_handle`), alternar `is_active`, ler/gravar `brand_profiles` (sem tocar em `playbook`), CRUD de `content_pillars`, listar e salvar `prompt_templates` com `version + 1`.
- Novo `src/hooks/useAjustes.ts` com as queries/mutations e invalidações.
- Componentes em `src/components/ajustes/`: `Ajustes.tsx` (chips + roteamento por aba via search param `aba`), `AbaPerfil.tsx`, `AbaEquipe.tsx`, `AbaContas.tsx`, `AbaMarca.tsx`, `AbaTemplates.tsx`.
- A rota `src/routes/_authenticated/ajustes.tsx` passa a validar `aba`, `secao` e `origem` e apenas renderizar o componente.
- Erros de permissão vindos do RLS são traduzidos em toast "Você não tem permissão para esta ação".

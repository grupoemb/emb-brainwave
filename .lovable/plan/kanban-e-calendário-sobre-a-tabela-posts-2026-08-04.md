# Kanban e Calendário sobre a tabela `posts`

Sem criar tabelas, sem migrations. Tudo lê/escreve nas tabelas existentes (`posts`, `content_pillars`, `approvals`, `profiles`, `organization_members`) com o usuário logado, respeitando o RLS.

## Base compartilhada

- **`useOrg()`** (novo hook): ainda não existe no projeto. Vai buscar a organização do usuário logado via `organization_members` e devolver `{ organizationId, papel, carregando }`, em cache com React Query. Todas as consultas de Kanban e Calendário filtram por esse `organizationId`.
- **Funções de servidor** (`src/lib/conteudo.functions.ts`), todas autenticadas: listar posts da org, listar pilares, criar post, atualizar status, atualizar data de agendamento, e checar se um post tem aprovação registrada.
- **Toasts**: montar o `<Toaster />` do sonner uma vez na raiz (hoje não está montado) para os avisos.
- **Movimento**: as duas telas usam o componente `Revelar` já existente (fade + subida, respeitando `prefers-reduced-motion`). Números com `.numero`, rótulos com `.rotulo`.
- **Arrastar e soltar**: HTML5 drag-and-drop nativo, sem nova dependência.

## Kanban (`/kanban`)

- 7 colunas fixas: Ideia, Roteiro, Arte, Revisão, Aprovado, Agendado, Publicado — cada uma com dot na cor definida, nome e contagem.
- Colunas com fundo `bg-2`, `rounded-xl`, cards com espaçamento de 10px.
- Card neutro (`.cartao`, 14px): ícone do canal + chip do pilar (cor do pilar com fundo a 13%), título em duas linhas no máximo, rodapé com avatar de iniciais do autor e data (`scheduled_for` ou `published_at`). Posts vindos de sugestão ganham borda esquerda azure e ícone de sparkles.
- Arrastar entre colunas grava o novo `status`. Antes de soltar em "Aprovado" ou "Agendado", verifica no servidor se existe aprovação (`approvals.decision = 'approved'`); se não houver, o movimento é cancelado e aparece o aviso âmbar "Este post ainda não foi aprovado".
- Botão "Novo card": diálogo com título obrigatório, canal, formato e pilar (carregado de `content_pillars`); cria com status `idea` e autor = usuário logado.
- Coluna "Publicado" mostra os 10 mais recentes com botão "ver todos" para expandir.
- Se as colunas de trabalho (Ideia→Agendado) estiverem vazias: estado vazio com a mensagem pedida e botão "Gerar pautas" que leva a `/pautas`.

## Calendário (`/calendario`)

- Toggle em chips entre visão mensal e semanal; semana começando na segunda, tudo em PT-BR (date-fns com locale pt-BR).
- Cada post com `scheduled_for` vira uma pill (altura 6, dot da cor do canal, título truncado, fundo `card-2`, hover claro). Clique abre um diálogo simples com título e status — o editor completo fica para depois.
- Máximo de 3 pills por dia; o excedente vira "+N" com popover listando o resto.
- Dia atual com anel azure a 40%.
- Faixa lateral "Sem data": posts entre `idea` e `approved` sem `scheduled_for`. Arrastar um deles para um dia grava `scheduled_for` ao meio-dia daquele dia no fuso America/Sao_Paulo.
- Arrastar uma pill de um dia para outro mantém a hora original e só muda a data.
- Barra de filtros no topo (chips ~30px, raio 8px, rolagem horizontal no mobile) por canal, pilar e status; ativo com fundo azure a 16% e texto branco.

## Detalhes técnicos

- Novos arquivos: `src/hooks/useOrg.ts`, `src/lib/conteudo.functions.ts`, componentes em `src/components/kanban/` e `src/components/calendario/`; as rotas `_authenticated/kanban.tsx` e `_authenticated/calendario.tsx` deixam de ser placeholders.
- Leitura/escrita via `createServerFn` com `requireSupabaseAuth` (RLS aplicado como o usuário); nenhuma chave de serviço envolvida.
- Mutações com React Query + invalidação das listas afetadas; atualização otimista no arrasto, com reversão em caso de erro ou bloqueio de aprovação.
- Escala de canais/status/cores centralizada num único módulo de constantes reutilizado pelas duas telas.

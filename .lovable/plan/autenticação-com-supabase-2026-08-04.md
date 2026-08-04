# Autenticação com Supabase

Controle de acesso ao app inteiro: só entra quem estiver logado.

## Decisões já definidas
- Login por e-mail e senha (sem Google).
- Perfil do usuário com nome e avatar.
- Cadastro aberto, sem confirmação de e-mail (entra direto).
- Todas as 9 telas protegidas; visitante é enviado para `/auth`.

## O que será feito

### 1. Ativar o backend (Lovable Cloud)
O projeto ainda não tem a integração de backend criada no código. Primeiro passo é ativá-la para ter autenticação, banco e chaves configuradas automaticamente.

### 2. Tela de acesso `/auth`
Página pública única, no mesmo tema escuro e tokens já existentes (cartão centralizado, tipografia Geist/Montserrat), com duas abas:
- Entrar: e-mail + senha.
- Criar conta: nome, e-mail, senha.

Mensagens de erro em PT-BR (credenciais inválidas, e-mail já cadastrado, senha curta). Confirmação de e-mail desativada para uso interno.

### 3. Proteção de todas as rotas
As 9 rotas atuais (`/`, criar, pautas, calendário, kanban, métricas, concorrentes, cérebro, ajustes) passam a ficar atrás de um portão de autenticação. Sem sessão, redireciona para `/auth`; com sessão, o app funciona como hoje (mesmas URLs, nada muda para o usuário logado).

### 4. Perfil no cabeçalho
No header da casca do app: avatar + nome do usuário e ação "Sair". Sair limpa a sessão e volta para `/auth`. Em `/ajustes`, um bloco simples para editar nome e URL do avatar.

### 5. Tabela de perfis
Migration criando `profiles` (id ligado ao usuário, nome, avatar, datas), com RLS: cada pessoa lê e edita apenas o próprio perfil. Gatilho cria o perfil automaticamente no cadastro, usando o nome informado.

## Detalhes técnicos
- Rotas protegidas movidas para `src/routes/_authenticated/` sob o layout gerenciado (`ssr: false`, redirect para `/auth`). `src/routes/index.tsx` é removido no mesmo passo em que `_authenticated/index.tsx` é criado, para não duplicar a rota `/`.
- `src/routes/auth.tsx` público, usando `supabase.auth.signInWithPassword` / `signUp` do cliente gerado.
- `onAuthStateChange` registrado uma única vez em `__root.tsx`, filtrado para SIGNED_IN/SIGNED_OUT/USER_UPDATED, com `router.invalidate()`.
- Leitura/atualização do perfil via `createServerFn` com `requireSupabaseAuth`; bearer anexado pelo `functionMiddleware` em `src/start.ts` (anexado à lista existente, sem substituir o CSRF/erro).
- Migration com `GRANT` para `authenticated`/`service_role`, RLS habilitada e políticas por `auth.uid()`. Nenhuma tabela existente é alterada.
- Auto-confirmação de e-mail ativada na configuração de auth.

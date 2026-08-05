# Painel de contas do Reels Radar

A sub-aba "Painel" já existe e já é a primeira/padrão em `/radar`, com os cards das contas e os dois gráficos comparativos. O que falta é o comportamento pedido agora: o clique no card deve abrir o ranking da conta ali mesmo (hoje ele joga o usuário para a aba Radar, que é a de colar link de concorrentes) e a seção com os melhores reels de todas as contas.

## O que muda

1. **Clique no card abre um painel lateral (drawer)**
   - Nada de ir para a aba Radar e nada de colar link.
   - O drawer carrega `radar_own_reels({ p_org, p_handle })` e mostra o ranking completo da conta: posição, caption truncada, views em `.numero`, pill de vx (verde ≥1.3, chama ≥2), alcance e salvamentos, e link que abre o reel no Instagram.
   - Estados de carregando, erro e vazio no padrão da fundação.

2. **Nova seção "Melhores reels de todas as contas"**
   - Alimentada por `radar_own_top_reels({ p_org, p_limit: 12 })`, carregada em paralelo com `accounts_overview` na abertura da aba.
   - Lista rankeada: posição, ícone/capa, caption truncada, badge do @handle, views em `.numero`, pill de vx com chama quando ≥2. Clicar abre o reel.

3. **Ajustes menores**
   - Topo mantém "Suas contas" + frescor "coletado há X".
   - Grid dos cards passa para `sm:2 lg:3` conforme pedido.
   - Estado vazio geral: "Aguardando a primeira coleta das contas."

## Detalhes técnicos

- `src/hooks/useContas.ts`: adicionar a chamada de `radar_own_top_reels` ao mesmo `queryFn` (paralelo com `Promise.all`) e um hook `useReelsDaConta(handle)` com `enabled` só quando o drawer está aberto.
- `src/lib/contas.ts`: tipos e normalização para `ReelProprio` (id, url, caption, views, reach, saves, likes, comments, vx) e para o item do top.
- Novos componentes em `src/components/radar/`: `DrawerConta.tsx` (usa `@/components/ui/sheet`) e `TopReelsContas.tsx`.
- `PainelContas.tsx`: troca `navigate` por estado local do handle selecionado e passa a renderizar o drawer e a seção de melhores reels.
- Tudo leitura via RPC existente; sem tabelas, migrations ou edge functions novas; RLS preservado (as funções já checam `is_org_member`).

# Pautas: cérebro contínuo + gerar agora

## Textos (src/components/pautas/Pautas.tsx)
- Descrição do cabeçalho → "O cérebro sugere pautas o tempo todo — sempre que aprende algo novo (post coletado, insight, post que bombou) — e aprende com cada pauta aceita."
- Empty state (status "new") → "Nenhuma pauta nova agora. O cérebro repõe sozinho ao longo do dia — ou clique em Gerar agora."

## Botão "Gerar pautas agora"
- Novo botão no slot `acoes` do `CabecalhoTela`, ao lado de "última rodada …".
- Ao clicar: `supabase.functions.invoke('suggest', { body: { organization_id: organizationId, force: true } })` com `organizationId` do `useOrg()`.
- Estado de loading (~20s): rótulo vira "Gerando…", botão desabilitado, spinner.
- Ao terminar: invalida a query `["sugestoes", organizationId]` para as novas pautas aparecerem no topo; toast de sucesso ou de erro.
- Implementação: mutação `gerar` exposta pelo `usePautas` em `src/hooks/useInteligencia.ts` (reusa o `invalidar` já existente), consumida pelo componente.

## Cérebro (opcional, incluído)
- Em `src/components/cerebro/Cerebro.tsx`, trocar "análise semanal" por "análise contínua" nos três textos.

## Fora de escopo
Nenhuma mudança no Supabase: sem migrations, sem novas Edge Functions — apenas chamada à função `suggest` existente.

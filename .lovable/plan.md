# Aba "Ideias" no Cérebro

Adicionar uma segunda aba no Cérebro onde a IA propõe pautas novas, variações do que já funcionou e adaptações de referências. Nada muda no banco — só leitura/escrita nas tabelas que já existem.

## O que o usuário vê

Topo do Cérebro ganha um toggle de duas abas, no mesmo estilo das sub-abas de Métricas:

```text
[ Aprendizados ]  [ Ideias (12) ]
```

- **Aprendizados**: exatamente a tela de hoje (playbook, audiência, insights ativos e histórico).
- **Ideias**: nova tela.

Na aba Ideias:

- Cabeçalho com botão "Gerar novas ideias" (estado de carregando, desabilitado enquanto roda) e o texto de apoio "a IA lê tudo que funcionou e propõe novas, variações e adaptações".
- Cards agrupados em três seções, cada uma só aparece se tiver ideias: **Novas**, **Variações**, **Adaptações**.
- Card: título em destaque; o roteiro (`angle`); a justificativa em texto apagado; linha "baseado em: ..." quando houver. Chips pequenos para formato, tipo de gancho, pilar e @perfil.
- Cor da borda/acento por tipo: nova = azure, variação = verde, adaptação = violeta.
- Ações: **Salvar**, **Descartar** e **Virar pauta**. Ideias salvas exibem um selo "Salva" e o botão Salvar fica marcado.
- Sem ideias: "Sem ideias ainda — clique em Gerar novas ideias".
- Enquanto carrega: esqueletos de card no lugar da lista.
- Toasts curtos de sucesso/erro em cada ação, no padrão do app.

## Detalhes técnicos

Novo hook `src/hooks/useIdeias.ts` (react-query + `useOrg()`):

- `useIdeias()` — `ideas` filtrado por `organization_id`, `.neq('status','dismissed')`, ordenado por `created_at` desc; `enabled: !!organizationId`; chave `["ideias", organizationId]`.
- `useGerarIdeias()` — `supabase.functions.invoke('ideas', { body: { organization_id, force: true } })`, invalida `["ideias"]` no sucesso.
- `useStatusIdeia()` — `update({ status })` em `ideas` por `id` (usada por Salvar e Descartar); invalida a lista. Descartar some da lista pelo `.neq`.
- `useVirarPauta()` — insert em `suggestions` com `kind:'theme'`, `title`, `rationale`, `suggested_channel:'instagram'`, `suggested_format: idea.format`, `priority: 60`, `status:'new'`; invalida `["ideias"]` e as queries de pautas.

Componentes novos em `src/components/cerebro/`:

- `Ideias.tsx` — cabeçalho, botão gerar, agrupamento por `tipo` (aceitando as variações de escrita nova/variacao/adaptacao), seções, empty state e esqueletos.
- `CartaoIdeia.tsx` — layout do card, chips e as três ações.

`Cerebro.tsx` passa a controlar o estado da aba (`aprendizados` | `ideias`) e renderiza o conteúdo atual ou `<Ideias />`. Nenhuma migration, edge function ou alteração de RLS.

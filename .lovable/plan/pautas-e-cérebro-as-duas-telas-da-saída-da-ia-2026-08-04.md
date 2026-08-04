# Pautas e Cérebro — as duas telas da saída da IA

Duas telas novas que mostram o que a IA produziu: as pautas sugeridas (com o ciclo completo até o resultado do post) e os aprendizados acumulados. Nada é criado no backend — só leitura/escrita nas tabelas que já existem, sempre filtradas pela organização do usuário.

## Tela /pautas

**Cabeçalho**
- Título "Pautas", frescor "última rodada de pautas há X" (a partir da suggestion mais recente).
- Nota em texto pequeno: "O cérebro gera pautas novas toda segunda de manhã, e aprende com o resultado de cada pauta aceita."

**Filtro em chips** (mesmo chip de 30px já usado em Métricas): Novas (padrão), Aceitas, Descartadas.

**Cards**, ordenados por prioridade decrescente, com a assinatura visual da IA (borda esquerda azure 2px a 60% + ícone sparkles):
- Pill do tipo (Pauta / Formato / Horário / Melhoria / Alerta, cada um com sua cor) e prioridade à direita em `.numero`.
- Título em negrito e o **porquê** (rationale) sempre visível abaixo, nunca escondido.
- Rodapé: formato sugerido, chip do pilar com a cor do pilar a 13%, e a trilha do loop em pills: nova → virou post → publicada → resultado (rx do post ligado, verde ≥1.3, neutro 0.7–1.3, coral <0.7; "aguardando métricas" quando ainda não há leitura ou baseline).
- Em pautas novas: "Aceitar" (cria o post ligado e abre `/post/:id`) e "Descartar".

**Vazio:** "Nenhuma pauta aberta. A próxima rodada automática é segunda de manhã."

## Tela /cérebro

Duas colunas no desktop:
- **Esquerda** — "O que os dados dizem": o playbook da marca renderizado como markdown, com a nota "Atualizado automaticamente pela análise semanal.".
- **Direita** — "Aprendizados": cards dos insights ativos (frase, barra fininha de força com gradiente royal→azure proporcional ao `strength`, resumo da evidência truncado em 2 linhas, pill de status) e, abaixo, um bloco colapsável "Histórico" com os enfraquecendo/refutados.
- Frescor no cabeçalho: "última análise há X", calculado pelo insight mais recente (não usa `ai_runs`, que é restrita a admins).
- **Vazio:** "O cérebro ainda não tem aprendizados. Eles nascem da análise automática sobre os posts coletados."

Ambas usam a entrada animada padrão (fade + subida, sem loops) e respeitam `prefers-reduced-motion`.

## Detalhes técnicos

Novo `src/lib/inteligencia.functions.ts` (todas com `requireSupabaseAuth`, RLS como o usuário):
- `listarSugestoes({ organizationId })` — `suggestions` com pilar via join simples, ordenado por `priority desc`; para as que têm `converted_post_id`, busca em lote os posts ligados (`id, status, channel, format, published_at`), as leituras de `post_metrics` desses posts (dedupe da mais recente por `post_id` no cliente) e as `metric_baselines` de `metric = 'reach'` para calcular o rx.
- `aceitarSugestao({ organizationId, suggestionId })` — insere em `posts` (title da pauta, `status: 'idea'`, `channel: suggested_channel`, `format: suggested_format`, `pillar_id`, `suggestion_id`, `author_id` do contexto autenticado — nunca vindo do cliente), depois atualiza a suggestion para `status: 'accepted'` + `converted_post_id`, e retorna o id do post.
- `descartarSugestao({ organizationId, suggestionId })` — `status: 'dismissed'`.
- `obterCerebro({ organizationId })` — `brand_profiles.playbook` (maybeSingle) + `insights` (statement, evidence, strength, status, first_seen_at) ordenados por força.

Componentes novos: `src/components/pautas/Pautas.tsx` (+ `CartaoPauta.tsx`, `TrilhaLoop.tsx`) e `src/components/cerebro/Cerebro.tsx` (+ `CartaoInsight.tsx`), com hooks `usePautas`/`useCerebro` em `src/hooks`. As rotas `pautas.tsx` e `cerebro.tsx` trocam o `ModuloEmConstrucao` pelos componentes e ganham head próprio.

Reaproveita o que já existe: `useOrg`, `Revelar` + `.secao-entrada`, `classeRx`/`textoFrescor`/`ultimaLeituraPorPost` de `src/lib/metricas.ts`, `.prosa` + `react-markdown` (já instalados na tela Criar), chip de filtro no padrão de `FiltrosMetricas`, toasts com sonner. Mutations com `useMutation` + invalidação da query de pautas. Nenhuma migration, tabela, bucket ou edge function.

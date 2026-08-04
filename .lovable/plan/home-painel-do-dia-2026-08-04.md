# Home (/) — painel do dia

Substituir o placeholder do Painel por um resumo do dia, somente leitura, filtrado pela organização do usuário e respeitando o RLS.

## Topo

- Saudação "Bom dia / Boa tarde / Boa noite, {primeiro nome}" (do perfil), data por extenso em PT-BR (ex.: "terça-feira, 4 de agosto de 2026") e frescor "coletado há X" a partir da última leitura de métricas.

## Faixa de 5 mini-KPIs

Grade 2 → sm:3 → xl:5, cartões min-h 5.9rem, número em `.numero text-2xl`, rótulo em `.rotulo`:

- Agendados (próximos 7 dias)
- Aguardando aprovação (status review)
- Pautas novas
- Alcance 7d (soma do alcance da última leitura dos posts publicados nos últimos 7 dias; "—" quando não houver)
- Contas conectadas

## Grid principal (lg:grid-cols-3)

1. **Próximos agendamentos** — posts agendados para os próximos 7 dias, em ordem de data: dot da cor do canal, título truncado, dia/hora em America/Sao_Paulo, e um dot âmbar com dica "sem aprovação" quando o post não tiver decisão positiva registrada. Clique abre `/post/:id`. Vazio: "Nada agendado pros próximos 7 dias." + botão "Abrir calendário".
2. **Pautas em destaque** — top 3 pautas novas por prioridade, em card compacto com a assinatura da IA (borda esquerda azure + sparkles), título, porquê em text-xs muted e prioridade em `.numero`. Rodapé "ver todas" → `/pautas`. Vazio: "Sem pautas abertas — a próxima rodada é segunda."
3. **O que os dados dizem** — top 3 aprendizados ativos por força, com statement e barra de força royal→azure. Rodapé "ver o cérebro" → `/cerebro`.

## Rodapé "Produção agora"

Uma linha com as colunas do kanban (Ideia → Publicado): dot da cor da coluna + contagem em `.numero text-sm`. O bloco inteiro leva para `/kanban`.

Toda a tela usa a entrada animada padrão e respeita prefers-reduced-motion; cada bloco tem frase própria para o estado vazio.

## Detalhes técnicos

- Novo `src/lib/painel.functions.ts` com uma única server function `carregarPainel` protegida por `requireSupabaseAuth`, que valida a organização e faz as leituras em paralelo: `posts` (agendados 7d, review, contagem por status, publicados 7d), `post_metrics` (últimas leituras dos posts publicados + max captured_at), `approvals` dos posts agendados, `suggestions` (new, top por priority), `insights` (active, top por strength), `social_accounts` (connected_at não nulo) e `profiles` para o nome. Retorna DTOs planos, sem nenhuma escrita.
- Reaproveita `ultimaLeituraPorPost`, `ultimaColeta`, `textoFrescor`, `numero` de `src/lib/metricas.ts` e `COLUNAS`, `corDoCanal`, `comAlfa` de `src/lib/conteudo.ts`.
- Novo hook `src/hooks/usePainel.ts` (React Query, key `["painel", organizationId]`).
- Componentes em `src/components/painel/`: `Painel.tsx` (composição), `MiniKpis.tsx`, `ProximosAgendamentos.tsx`, `PautasDestaque.tsx`, `InsightsDestaque.tsx`, `ProducaoAgora.tsx`, mais skeletons no padrão já usado.
- `src/routes/_authenticated/index.tsx` passa a renderizar `Painel` mantendo o `head()` atual.
- Sem migrations, sem tabelas novas, sem edge functions.

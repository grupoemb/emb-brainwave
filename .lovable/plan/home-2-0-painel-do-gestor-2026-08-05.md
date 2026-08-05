# Home 2.0 — painel do gestor

Reconstrução visual e analítica da home: pódio com hierarquia real (1º/2º/3º, medalhas ouro/prata/bronze, avatar da conta) e muito mais KPIs, tudo lido das tabelas que já existem (`posts`, `post_metrics`, `metric_baselines`, `suggestions`, `insights`, `audience_notes`, `approvals`, `social_accounts`). Sem migrations, sem tabelas novas, sem edge functions.

## Topo — barra de comando

Saudação + data + frescor da coleta como hoje, e ao lado o seletor de janela (7 / 14 / 30 / 90 dias) que passa a reger o painel inteiro, com comparação automática contra a janela anterior de mesmo tamanho (todo número ganha delta em % com seta verde/vermelha).

## Faixa de KPIs (2 linhas, 12 indicadores)

Cartões compactos com número em `.numero`, rótulo, sparkline discreta quando houver série e delta vs. período anterior:

Desempenho: Alcance, Impressões, Interações, Engajamento %, Salvamentos, Compartilhamentos, Comentários, Seguidores ganhos (`followers_delta`), Retenção média (`retention_pct`), rx médio, Fora da curva, Frequência (posts/semana).

Operação (linha fina abaixo, tipo "status bar"): Agendados 7d, Aguardando aprovação, Pautas novas, Contas conectadas, Posts publicados na janela — cada um clicável para a tela filtrada, como já é hoje.

## Ranking de contas — pódio visual

Substitui os três cartões iguais de hoje por um pódio com hierarquia clara:

- **1º lugar** ocupa o dobro da largura, com moldura em degradê dourado, glow suave, medalha de ouro e números maiores.
- **2º e 3º** em cartões menores lado a lado, com medalha prata e bronze.
- Demais contas viram uma lista compacta abaixo ("4º em diante") com handle, alcance e rx.

Cada cartão traz:

- Avatar circular da conta: foto quando `social_accounts.meta.avatar_url` existir; caso contrário, iniciais sobre degradê derivado do handle, com anel na cor do canal e um selo de medalha no canto.
- Handle, canal e nº de posts na janela.
- Alcance total (número grande) + variação vs. janela anterior.
- Barra de participação no alcance da organização.
- Grade de mini-métricas: alcance médio/post, engajamento %, rx médio (pill colorida), consistência (rx ≥ 1), fora da curva (flame), salvamentos + compartilhamentos, seguidores ganhos.
- Mini-sparkline do alcance diário da conta na janela.
- Linha "melhor post" clicável para `/post/:id` com `origem=painel`.

O critério de ordenação é escolhível por chips: Alcance · Engajamento · rx médio · Consistência — as medalhas seguem o critério ativo.

## Destaques do período

Faixa de campeões mantida, porém redesenhada como cartões com ícone em círculo colorido: Melhor alcance, Melhor engajamento, Maior rx, Conta mais consistente, Post que mais trouxe seguidores, Post mais salvo.

## Blocos analíticos (grade)

- **Alcance no tempo** — área empilhada por conta (recharts), com toggle diário/acumulado.
- **Mix de formatos** — donut com participação de reels/carrossel/estático e rx médio de cada.
- **Melhores janelas** — mini mapa de calor dia × faixa de horário do alcance publicado.
- **Fora da curva** — lista atual, com avatar da conta e miniatura do rx.
- **Funil da operação** — Ideia → Roteiro → Revisão → Agendado → Publicado com contagens e gargalo destacado.
- **Pautas em destaque** e **O que os dados dizem** — mantidos, com visual alinhado aos novos cartões.
- **O que a audiência pede** — top 3 temas/perguntas dos últimos 30 dias (`audience_notes`), com link para `/cerebro`.

Todos os blocos mantêm tooltips do glossário, estados vazios com `EstadoVazio` e a entrada animada padrão (respeitando `prefers-reduced-motion`).

## Detalhes técnicos

- `src/lib/painel.functions.ts`: `carregarPainel` passa a aceitar `dias: 7 | 14 | 30 | 90` e a retornar `kpis` ampliados (impressões, interações, salvos, shares, comentários, followers_delta, retenção, frequência) com bloco `anterior` para os deltas, `serieAlcance` (por dia e por conta), `mixFormatos`, `calor`, `funil` e `contas` enriquecidas (série diária, salvos/shares, seguidores). A consulta de `post_metrics` passa a selecionar `impressions, clicks, watch_time_s, retention_pct, followers_delta`. Reaproveita `numero`, `classeRx`, `textoFrescor` de `src/lib/metricas.ts` e a lógica de baseline/rx já existente.
- Também busca `social_accounts` (handle, channel, meta) para casar avatar e canal com o `meta->>'source_handle'` dos posts, e `audience_notes` dos últimos 30 dias.
- Novos componentes em `src/components/painel/`: `BarraJanela.tsx`, `GradeKpis.tsx`, `CartaoKpiPainel.tsx` (com sparkline e delta), `Podio.tsx` + `CartaoConta.tsx` + `AvatarConta.tsx` + `Medalha.tsx`, `AlcanceNoTempo.tsx`, `MixFormatos.tsx`, `JanelasQuentes.tsx`, `FunilOperacao.tsx`, `AudienciaResumo.tsx`. `Painel.tsx` vira só composição; `ComparativoContas.tsx` é substituído pelo pódio.
- Tokens de medalha (ouro/prata/bronze) adicionados em `src/styles.css` reaproveitando `--dourado`, sem cores soltas nos componentes.
- `src/hooks/usePainel.ts` passa a incluir a janela e o critério de ordenação na query key.
- Esqueletos novos no mesmo padrão para KPIs, pódio e gráficos.

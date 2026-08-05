# Lista de posts em /metricas — filtros, ranking e leitura visual

A tabela "Posts do período" hoje é uma grade densa de 11 colunas, todas com o mesmo peso, com apenas busca por texto, botões Top/Piores e "fora da curva". A proposta é transformá-la num painel de ranking configurável e bem mais legível.

## 1. Ranking por qualquer KPI

Acima da lista, um seletor **"Ranquear por"** (menu no padrão `MenuFiltro` já usado no app) com todas as métricas legíveis:

- Alcance · Impressões · Salvos · Shares · Comentários · Curtidas · Data
- rx (desempenho relativo à mediana do formato)
- Taxas derivadas, calculadas na hora: Engajamento % ((curtidas+coment+salvos+shares)/alcance), Salvos %, Shares %, Comentários %, Frequência (impressões/alcance)

Ao lado, um botão de direção (maior→menor / menor→maior) que substitui o par Top/Piores por algo que vale para qualquer métrica; clicar no cabeçalho da coluna continua ordenando por ela.

**Sobre "seguidores que o post trouxe":** a coluna existe no banco (`post_metrics.followers_delta`), mas está vazia em todas as 524 leituras coletadas — a coleta atual não traz esse dado. Vou incluir a métrica no seletor e na tabela já preparada, exibindo "—" e um aviso curto de "ainda não coletado" enquanto não houver valores, sem inventar número. Mesmo tratamento para cliques, retenção e tempo de exibição (também vazios hoje).

## 2. Filtros da lista

Uma linha de controles compacta, tudo combinável e refletido na contagem de resultados:

- **Busca** por título/conta (já existe, com botão de limpar).
- **Formato**: chips Todos · Reel · Carrossel · Imagem · Story, com contagem.
- **Faixa de rx**: Todos · Acima da média (≥1,3) · Na média · Abaixo (<0,7) · Fora da curva (≥2,0) — absorve o botão atual "fora da curva".
- **Filtro numérico**: "mostrar só posts com [métrica] acima de [valor]", usando a mesma métrica do ranking.
- **Quantidade**: 10 / 20 / 50 / todos (hoje fixo em 20).
- Resumo "N de M posts" + "limpar filtros" quando algo estiver ativo.

Os filtros de conta/pilar/período continuam vindo do cabeçalho da tela, sem duplicação.

## 3. Mais visual e menos corrida

- **Colunas essenciais x detalhe**: por padrão a tabela mostra Título, Conta, Formato, Data, Alcance, a métrica de ranking e rx. Um botão "Colunas" abre a lista completa para ligar/desligar cada uma — quem quiser a visão densa atual liga tudo.
- **Ranking explícito**: coluna de posição (#1, #2…) em `.numero text-muted`, com destaque sutil para os três primeiros.
- **Barra proporcional** na métrica ranqueada (relativa ao maior valor da lista), no mesmo estilo da barra de rx atual — dá leitura instantânea da distribuição.
- **Respiro e zebra**: altura de linha maior, separadores mais suaves, hover com fundo e borda esquerda azure, agrupamento visual das colunas (identificação | alcance | interação | desempenho) com cabeçalho em dois níveis.
- **Título com contexto**: miniatura de formato (ícone) antes do título, badge de pilar com a cor do pilar, `@conta` em pill.
- **Mobile**: abaixo de `sm` a tabela vira lista de cartões (título + conta + 3 métricas em destaque + rx), eliminando o scroll horizontal de 940px.
- Estados vazios específicos por filtro ativo, no padrão `EstadoVazio` já usado.

## Detalhes técnicos

- Tudo em frontend: `src/components/metricas/TabelaPosts.tsx` é dividido em `TabelaPosts.tsx` (orquestra filtros/ordenação), `FiltrosTabelaPosts.tsx` (controles) e `LinhaPost.tsx` / `CartaoPostMetrica.tsx` (linha desktop e cartão mobile).
- Métricas derivadas e o catálogo de colunas ficam em `src/lib/metricas.ts` (`METRICAS_TABELA`, com rótulo, extrator, formatador e se é taxa), reaproveitando `compacto`, `numero`, `classeRx`, `ehOutlier`.
- `LinhaMetrica` ganha os campos hoje presentes em `post_metrics` mas ainda não lidos (`followers_delta`, `clicks`, `retention_pct`, `watch_time_s`), incluídos no `select` de `src/lib/metricas.functions.ts` — leitura apenas, mesma RLS.
- Estado de ranking/filtros da tabela fica local ao componente (não polui a URL da rota), exceto o modo Top/Piores já existente que continua vindo por prop de `Metricas.tsx`.
- Sem migrations, sem tabelas, sem edge functions.

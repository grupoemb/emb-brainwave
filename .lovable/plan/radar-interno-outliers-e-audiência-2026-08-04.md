# Radar interno: outliers e audiência

Três adições somente-leitura sobre tabelas que já existem (`posts`, `post_metrics`, `metric_baselines`, `audience_notes`). Sem migrations, sem backend novo, tudo filtrado por organização e respeitando o RLS.

Regra única de outlier: `rx >= 2.0` (alcance da última leitura dividido pela mediana do formato em `metric_baselines`). O cálculo de `rx` já existe em `src/lib/metricas.ts`.

## 1) Métricas (/metricas)

- Na tabela de posts, quando `rx >= 2.0`, um ícone flame de 12px na cor #f6bd24 aparece ao lado da pill de rx, com tooltip nativo "Fora da curva: 2.4x a mediana do formato" (número real do post).
- O cartão de KPI "rx médio" vira clicável: ao clicar, a tabela passa a mostrar só os outliers; clicar de novo volta ao normal. O cartão fica com estado visual ativo (borda azure) e a tabela ganha uma linha de contexto "mostrando só os posts fora da curva" com atalho para limpar, no mesmo padrão dos vazios filtrados já usados.
- Se o filtro não retornar nada: mensagem "Nenhum post fora da curva neste período." com o mesmo atalho de saída.

## 2) Painel (/)

Novo bloco "Fora da curva — 7 dias", posicionado entre os blocos existentes:

- Posts publicados nos últimos 7 dias com `rx >= 2.0`, ordenados por rx decrescente.
- Cada linha: título truncado + conta + pill verde com o rx + ícone flame; clique abre `/post/:id`.
- Vazio: "Nenhum post fora da curva nesta semana."

## 3) Audiência (`audience_notes`)

### /cerebro — cartão "O que a audiência pede"

Abaixo do playbook. Agrega as listas `questions` e `themes` das notas dos últimos 30 dias da organização e mostra os 5 itens mais recorrentes como lista simples (texto `text-sm` + contagem em `.numero text-xs` muted). Assinatura de IA: borda esquerda azure de 2px + ícone sparkles 12px.

Vazio: "Aguardando leitura de comentários — permissão pendente nos tokens das contas."

### /post/:id — nova aba "Audiência" na coluna lateral

Junto das abas existentes (versões/aprovações). Se houver `audience_notes` do post: `summary`, sentimento como pill (positivo `pill-bom`, negativo `pill-ruim`, misto `pill-alerta`, neutro neutra), e temas e perguntas como listas. Mesma assinatura de IA.

Se `sentiment = 'sem_volume'` ou não existir nota: "Sem leitura de audiência para este post ainda."

## Detalhes técnicos

- `src/lib/metricas.ts`: constante `LIMITE_OUTLIER = 2.0` e helper `ehOutlier(rx)`, reutilizado nas três telas.
- `src/components/metricas/TabelaPosts.tsx` e `CartaoKpi.tsx`: props opcionais para o modo outlier e para tornar um KPI clicável; estado do toggle fica em `Metricas.tsx` (não vai para a URL, é um modo de leitura efêmero).
- `src/lib/painel.functions.ts`: nova consulta de outliers de 7 dias reaproveitando a mesma junção posts + última leitura de `post_metrics` + `metric_baselines`; render em um novo componente `src/components/painel/ForaDaCurva.tsx`.
- `src/lib/inteligencia.functions.ts`: server functions de leitura de `audience_notes` — agregação de 30 dias por organização e busca por `post_id`. Novos componentes `src/components/cerebro/AudienciaPede.tsx` e `src/components/conteudo/AudienciaPost.tsx`.
- Sem writes, sem novas tabelas, sem edge functions; todas as leituras passam pelo RLS de membro da organização.

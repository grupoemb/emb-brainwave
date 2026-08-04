# Mini-KPIs com contexto: filtros, carregamento e vazios específicos

Hoje os mini-KPIs do painel levam para as telas de destino, mas a tela aberta não indica de onde veio nem o que foi filtrado. O plano dá contexto de ponta a ponta: tooltip explícito no link, filtro realmente aplicado na chegada, esqueleto e mensagem vazia escritos para aquele recorte.

## 1. Tooltips nos mini-KPIs

Cada cartão ganha um tooltip (componente `tooltip` do shadcn, já no projeto) descrevendo exatamente o recorte que será aberto:

- Agendados — "Abrir o calendário nos próximos 7 dias"
- Aguardando aprovação — "Abrir o kanban na coluna Revisão"
- Pautas novas — "Abrir as pautas com status Nova"
- Alcance 7d — "Abrir métricas no período de 7 dias"
- Contas conectadas — "Abrir ajustes na seção de contas conectadas"

Quando o valor for zero (ou "—" no alcance), o tooltip acrescenta a razão: "nada agendado pros próximos 7 dias", "nenhuma leitura de métricas nos últimos 7 dias", etc.

## 2. Filtro aplicado na chegada

Cada link passa parâmetros de URL, sempre com `origem=painel`:

- `/calendario?foco=7d&origem=painel` — abre na visão de semana a partir de hoje.
- `/kanban?foco=review&origem=painel` — destaca a coluna Revisão (leve realce de borda) e rola até ela.
- `/pautas?status=new&origem=painel` — já suportado; só o `origem` é novo.
- `/metricas?dias=7&origem=painel` — período de 7 dias pré-selecionado.
- `/ajustes?secao=contas&origem=painel` — rola até o bloco de contas conectadas.

Os parâmetros são opcionais: quem entra pelo menu continua vendo o comportamento padrão de hoje.

## 3. Faixa de contexto

Com `origem=painel`, a tela mostra no topo uma faixa discreta: "Filtrado a partir do painel · {recorte}" com um botão "limpar recorte" que remove os parâmetros e volta ao estado padrão da tela.

## 4. Carregamento específico

Enquanto os dados carregam com recorte vindo do painel, o esqueleto reflete o que vai aparecer, em vez do genérico:

- Calendário: esqueleto de faixa semanal (7 colunas) em vez do mês inteiro.
- Kanban: esqueleto só da coluna em foco em tamanho normal; as demais em largura reduzida.
- Pautas: 3 cartões-esqueleto (padrão atual) + a faixa de contexto já visível.
- Métricas: esqueleto atual, com a faixa de contexto já visível.

Em todos os casos a faixa de contexto aparece imediatamente, antes dos dados, para o usuário saber o que está sendo carregado.

## 5. Mensagens vazias específicas

Quando o recorte vem do painel e não há resultado, a mensagem cita o recorte e oferece a saída:

- Calendário: "Nada agendado pros próximos 7 dias." + "ver o mês inteiro".
- Kanban/Revisão: "Nenhum post aguardando aprovação." + "ver todo o fluxo".
- Pautas: "Nenhuma pauta nova. A próxima rodada automática é segunda de manhã." + "ver todas as pautas".
- Métricas: "Sem leituras de métricas nos últimos 7 dias." + "ver 30 dias".
- Ajustes: "Nenhuma conta conectada ainda." no bloco de contas.

## Detalhes técnicos

- `validateSearch` com `zodValidator` + `fallback` nas rotas `calendario`, `kanban`, `metricas` e `ajustes`, seguindo o padrão já usado em `pautas.tsx` (campos como `foco`, `dias`, `secao`, `origem`, todos com default que reproduz o comportamento atual).
- Novo componente `src/components/painel/FaixaDeContexto.tsx` (faixa + ação "limpar recorte"), reutilizado pelas quatro telas; limpar usa `navigate({ search: {} })`.
- `Painel.tsx`: `MiniKpi` passa a receber `dica` e o destino tipado; os cinco cartões são envolvidos por `Tooltip`/`TooltipTrigger`/`TooltipContent`, com `TooltipProvider` no `AppShell` caso ainda não exista.
- `Metricas.tsx`/`useMetricas`: o estado `dias` é inicializado a partir do search param quando presente (mantendo o restante do estado local intacto).
- `Kanban.tsx` e `Calendario.tsx` leem o `foco` via `Route.useSearch()` para escolher visão inicial, realce e o esqueleto correspondente; novos esqueletos entram em `src/components/conteudo/Esqueleto.tsx`.
- Nenhuma mudança de dados: sem migrations, sem novas tabelas, sem novas server functions.

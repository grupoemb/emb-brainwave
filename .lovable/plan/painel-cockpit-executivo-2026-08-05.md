# Painel → cockpit executivo

Hoje o Painel é uma parede de ~16 cartões iguais mais blocos soltos. A reforma cria hierarquia (heróis → gráfico âncora → grupos → pódio), coloca filtro por perfil e lente de foco, e usa cor com significado. Nada de backend novo: só leitura das mesmas tabelas, com o recorte por perfil feito dentro da função de carregamento que já existe.

## 1. Controles no topo (cabeçalho sticky)

- Seletor de período 7/14/30/90 (mantém) + **segmented control de perfil**: "Todos" + um botão por handle, vindo da lista `perfis` que a carga passa a devolver (nunca hard-coded). Estado só em memória.
- **Lente de foco**: Crescimento (padrão) · Engajamento · Produção. Muda quais 3 KPIs viram heróis e a ordem das seções.
- Cabeçalho vira `sticky top-0` com fundo do app e borda inferior; frescor da coleta continua à direita.

## 2. Faixa "O que mudou"

Substitui os insights soltos no topo. Duas a três manchetes determinísticas (sem IA), cada uma com ponto colorido:

- Verde: maior variação favorável entre alcance/engajamento/salvamentos/compartilhamentos/seguidores vs. período anterior, citando o perfil que mais contribuiu.
- Vermelha: só quando existe queda relevante (limiar de 15%).
- Neutra: melhor post do período (`destaques.melhorAlcance`), com conta e alcance.

Sem bullets; tipografia de manchete curta.

## 3. Linha de heróis (3 cartões grandes)

Conforme a lente: Crescimento = Alcance · Novos seguidores · Ritmo/Posts; Engajamento = Engajamento % · Salvamentos · Compartilhamentos; Produção = Posts publicados · Agendados 7d · Pautas novas.

Cada herói: número grande, delta com seta (verde melhorou / vermelho piorou), sparkline recharts quando há série (alcance geral ou `conta.serie` no modo perfil) e, sem série, mini-barra atual vs. anterior. Cor de acento distinta por herói.

## 4. Gráfico âncora — Evolução do Alcance

Full width, AreaChart com gradiente azure→transparente sobre `serie`, linha cinza tracejada do período anterior sobreposta, dots destacados nos dias fora da curva, tooltip em pt-BR com datas e números compactos.

## 5. Composição por perfil

- Filtro = Todos: barra empilhada horizontal (ou donut) da fatia de alcance por perfil (`contas[].alcance`), uma cor por perfil, legenda com % — mostra quem puxa o resultado.
- Perfil selecionado: troca pelo donut de `mixFormatos` daquele perfil.

## 6. Grid secundário agrupado

Três blocos com rótulo e acento próprios, separados por linha fina:

- **Distribuição** (azure): Impressões, Compartilhamentos, Alcance médio/post.
- **Ressonância** (verde): Salvamentos, Comentários, Engajamento %, Retenção.
- **Produção** (violeta): Posts publicados, Ritmo semanal, Agendados 7d, Aguardando aprovação, Pautas novas.

Cartões pequenos: rótulo, valor, chip de delta (subir = verde, cair = vermelho) e ícone sutil. Os cartões operacionais continuam clicáveis para calendário/kanban/pautas.

## 7. Pódio e destaques

- Pódio repaginado quando "Todos": medalha 1/2/3, avatar, seguidores, alcance, média/post, engajamento, consistência e mini-sparkline da conta.
- Com um perfil selecionado, o pódio vira um resumo expandido só daquele perfil.
- "Melhor alcance / engajamento / RX / mais salvo" viram uma faixa compacta "Melhores da semana", cada item com ícone, cor da métrica e link para o post — não mais cartões de KPI.

## 8. Acabamento

Tokens semânticos bom/alerta/ruim/neutro já existentes usados com significado; cantos arredondados e bordas sutis do `.cartao`; hover nos itens clicáveis; skeletons por bloco; fade/slide sutil ao trocar período, perfil ou lente (respeitando `prefers-reduced-motion`).

Blocos que hoje ficam no fim (janela de publicação, fora da curva, agendamentos, pautas, cérebro, voz da audiência) permanecem, abaixo do cockpit, sem duplicar a aba Métricas.

## Detalhes técnicos

- `src/lib/painel.functions.ts`: `handle: z.string().optional()` no validador. No handler, ao vir `handle`, filtrar `publicados`/`anteriores` por `p.meta?.source_handle === handle` e restringir `contasBrutas`/`contasInfo` àquele handle antes de `agregarPainel`. Novo campo de retorno `perfis: { handle, avatarUrl }[]` montado da lista completa de `social_accounts` (sem filtro), e `serieAnterior` vindo do agregado do período anterior para a linha fantasma do gráfico.
- `src/lib/painel.tipos.ts`: acrescentar `perfis` e `serieAnterior` a `DadosPainel`.
- `src/hooks/usePainel.ts`: aceitar `handle?: string`, repassar ao server fn e incluir na `queryKey` (mantém `keepPreviousData`).
- `src/components/painel/Painel.tsx` reescrito como orquestrador enxuto, com estados `dias`, `perfil`, `foco`.
- Novos componentes em `src/components/painel/`: `ControlesPainel.tsx`, `OQueMudou.tsx`, `CartaoHeroi.tsx`, `LinhaHerois.tsx`, `ComposicaoPerfis.tsx`, `GrupoKpisPainel.tsx`, `MelhoresDaSemana.tsx`, `ResumoPerfil.tsx`, mais `src/lib/painel.leitura.ts` com as regras determinísticas das manchetes e o mapa de lentes/acentos.
- `EvolucaoAlcance.tsx` ganha props opcionais de série anterior e de outliers; `Podio.tsx` e `DestaquesPeriodo.tsx` são repaginados no lugar.
- Gráficos com recharts (já instalado). Nenhuma tabela, RPC, edge function ou migration nova; RLS intacto.

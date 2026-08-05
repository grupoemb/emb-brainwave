# Metas: manter todas as metas e redesenhar os cards

## O que está acontecendo

Hoje existe apenas **1 meta gravada no banco** (Seguidores — @b7school, criada às 17:10). A tela em si já lista todas as metas retornadas e só esconde por filtro de perfil/status — ou seja, o sumiço acontece antes da tela: ou a meta anterior está sendo **sobrescrita em vez de criada**, ou o filtro de status ativo deixa a antiga fora da vista. A causa exata ainda não está confirmada (o acesso de leitura ao banco expirou no meio da checagem), então o primeiro passo é confirmar antes de mexer.

## Passo 1 — Confirmar a causa (antes de qualquer mudança)

- Conferir se o formulário está enviando um `id` mesmo ao clicar em "Nova meta" (o que transforma o salvamento em atualização da meta antiga, explicando o desaparecimento).
- Conferir no banco se existe alguma regra/gatilho que remove metas duplicadas da mesma organização.
- Reproduzir: criar duas metas seguidas e verificar quantas linhas ficam gravadas.

## Passo 2 — Garantir que nada some

- No diálogo de meta: limpar o estado por completo ao fechar e ao abrir em modo "Nova meta", de forma que criar nunca herde a identidade de uma meta editada anteriormente.
- No salvamento: separar explicitamente "criar" de "editar" — criar sempre insere uma linha nova; editar só atualiza quando veio de um card específico.
- Depois de salvar, a lista é recarregada e os filtros são ajustados para que a meta recém-criada apareça (se o filtro de status/perfil ativo a esconderia, o filtro volta para "todos" e um aviso curto explica).
- Contador visível de metas ("N metas") ao lado do filtro, para ficar evidente quantas existem no total x quantas o filtro está mostrando.

## Passo 3 — Redesenho do card (densidade e hierarquia)

Problema atual: o card ocupa uma coluna inteira com muito ar entre blocos (anel gigante, quatro caixas de PACE em linha, gráfico alto, cohort semanal sempre aberto).

Novo layout, em duas faixas compactas:

```text
┌───────────────────────────────────────────────────────────┐
│ [ic] Seguidores — @b7school        [atrasado] [editar][x] │
│      @b7school · 01/08 a 31/08 · faltam 26 dias           │
├───────────────┬───────────────────────────────────────────┤
│   anel 0%     │ 0 / 13,6 mil · faltam 13,6 mil            │
│   (menor)     │ ritmo 0/dia · precisa 521/dia · proj. 0   │
├───────────────┴───────────────────────────────────────────┤
│ gráfico Evolução vs Meta (mais baixo, largura total)      │
├───────────────────────────────────────────────────────────┤
│ ▸ Ritmo semanal (recolhido por padrão)                    │
└───────────────────────────────────────────────────────────┘
```

- Anel de progresso menor, colado ao número principal (uma linha só, sem bloco solto).
- Os quatro quadros de PACE viram uma faixa de 4 mini-itens compactos, com rótulo em cima e valor abaixo, sem caixas grandes e sem texto de apoio quebrando em três linhas — o detalhe vira tooltip.
- "Faltam N dias · ETA" sobe para o subtítulo do cabeçalho.
- Gráfico com altura reduzida e margens menores; legenda em linha única.
- "Ritmo semanal" vira seção recolhível (fechada por padrão) para o card caber sem rolagem.
- Grade responsiva: 1 coluna no celular, 2 em telas médias, 3 em telas largas — hoje só abre 2 colunas em telas muito grandes, o que deixa metade da tela vazia.
- Cores continuam semânticas (batido/adiantado/no ritmo/atrasado) e os estados de carregamento acompanham a nova altura do card.

## Detalhes técnicos

- Arquivos: `src/components/metas/Metas.tsx`, `CartaoMeta.tsx`, `BlocoPace.tsx`, `AnelProgresso.tsx`, `GraficoEvolucaoMeta.tsx`, `RitmoSemanal.tsx`, `DialogMeta.tsx`, `src/hooks/useMetas.ts`.
- Sem alterações no Supabase: nada de tabelas, funções ou migrations; segue usando `goals_overview` e a tabela `goals`.
- Filtros permanecem client-side sobre a lista completa retornada pela RPC.

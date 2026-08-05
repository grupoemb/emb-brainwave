# Aba Metas — pace, projeção e evolução

Nova aba onde o gestor define metas de KPI e vê, de bate-pronto, se está no ritmo de bater — e quanto precisa por dia se não estiver. Só leitura/escrita no que já existe no Supabase (tabela `goals` + função `goals_overview`); nada de criar tabela, função ou migration.

## Navegação

- Nova rota `/metas` em `src/routes/_authenticated/metas.tsx`, com metadados próprios de head.
- Item "Metas" (ícone de alvo) no grupo **Inteligência** da navegação lateral, entre Métricas e Pautas, com sinônimos para a busca global ("objetivo", "pace", "ritmo", "projeção").

## Dados

- `src/hooks/useMetas.ts`:
  - `useMetas()` — react-query chamando `goals_overview` com o `organizationId` do `useOrg()`, normalizando o JSON de retorno para um tipo tipado com exatamente os campos do dicionário informado.
  - `usePerfisMeta()` — lista de handles de `social_accounts` para o filtro e o dialog.
  - `useCriarMeta()` / `useEditarMeta()` / `useExcluirMeta()` — mutations diretas em `goals` (a RLS por organização já cobre insert/update/delete), invalidando a query de metas e mostrando toast de sucesso/erro.
- `src/lib/metas.ts` — rótulos e ícones por métrica, rótulos de modo, cor/rotulo por status, e formatação de ritmo ("17,5 mil/dia"), datas dd/MM e percentuais.

## Topo da aba

- Título "Metas", subtítulo curto e botão **Nova meta**.
- Filtro por perfil (Todas / @perfis) no mesmo padrão de chips do Painel — filtra os cards no cliente.
- Faixa de resumo com contadores clicáveis por status: batidas e adiantadas (verde), no ritmo (azure), atrasadas (vermelho), encerradas (cinza). Clicar filtra os cards.
- Skeletons enquanto carrega.

## Card da meta

Um card por item de `goals_overview`, na ordem em que a função devolve:

1. **Cabeçalho** — ícone da métrica, título (`label` ou automático, ex.: "Alcance — @b7school"), chip de escopo (Todas as contas / @handle) e pill de status colorida.
2. **Progresso** — anel com o `pct` em %, `progress / effective_target` formatados e "faltam X".
3. **Bloco PACE** — quatro leituras curtas:
   - Ritmo atual: `run_rate`/dia
   - Nesse ritmo você chega a `projected` (`projected_pct`) até `end_date`
   - Para bater, precisa de `required_run_rate`/dia — em vermelho quando maior que o ritmo atual
   - vs. esperado hoje: `ahead` (verde ≥ 0, vermelho < 0), com `pace_expected` como referência
   - Rodapé: "Faltam `days_left` dias · ETA `eta`" (verde se dentro do prazo, âmbar se estoura, "sem ETA" quando null)
4. **Evolução vs. Meta** (recharts, gráfico principal) — X = `serie[].d`; área sólida colorida = Real (`prog`), linha tracejada cinza = Meta (`pace`), segmento tracejado do ponto de hoje até (`end_date`, `projected`) = Projeção, e linha horizontal de referência no `effective_target`. Legenda Real · Meta · Projeção e tooltip pt-BR.
5. **Ritmo por semana** (BarChart) — `buckets[].semana` × `buckets[].valor`, com linha de referência no ritmo semanal necessário (`required_run_rate × 7`); barras abaixo da referência em tom mais fraco.
6. **Ações** — editar (reabre o dialog preenchido) e excluir com confirmação em AlertDialog.

## Dialog Nova/Editar meta

- Métrica (select): Seguidores, Alcance, Impressões, Interações, Salvamentos, Compartilhamentos, Comentários, Posts.
- Perfil (select): Todas as contas (`handle` null) ou um perfil (handle minúsculo, sem @).
- Tipo: só aparece para Seguidores — "Ganhar N novos" (`increase`) ou "Chegar a N no total" (`absolute`); nas demais métricas fica fixo em `accumulate`.
- Alvo numérico com placeholder contextual por métrica.
- Período com date pickers e atalhos "Este mês", "Próximos 30 dias", "Trimestre".
- Rótulo opcional.
- Salvar grava `organization_id, handle, metric, mode, target, start_date, end_date, label` com `baseline` nulo (a função calcula) e invalida a query.

## Empty state

Tela amigável com CTA "Criar primeira meta" e dois exemplos clicáveis que abrem o dialog pré-preenchido: "+5.000 seguidores em 30 dias (@b7school)" e "1.000.000 de alcance neste mês (todas as contas)".

## Detalhes técnicos

- Componentes novos em `src/components/metas/`: `Metas.tsx` (orquestrador), `ResumoStatus.tsx`, `CartaoMeta.tsx`, `AnelProgresso.tsx`, `BlocoPace.tsx`, `GraficoEvolucaoMeta.tsx`, `RitmoSemanal.tsx`, `DialogMeta.tsx`, `SemMetas.tsx`.
- `goals_overview` é tipada como `Json` nos tipos gerados; a normalização e a validação de forma ficam em `src/lib/metas.ts`, sem alterar `types.ts`.
- Cores vêm dos tokens já usados no Painel (bom/alerta/ruim/azure/muted); nada de cor decorativa nova nem hardcode fora do sistema.
- Formatação reaproveita `compacto`/`numero` de `src/lib/metricas.ts`; datas em `dd/MM` no fuso America/Sao_Paulo.
- Animação de entrada segue o padrão `Revelar` + `secao-entrada` das outras telas; sem loops.

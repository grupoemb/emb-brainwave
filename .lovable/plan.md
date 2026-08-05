# Bloco "Inteligência" no Painel

Novo bloco no Painel (home) com três partes — faixa de taxas, melhor horário e alertas/leitura da semana — usando só o backend que já existe. Nenhuma mudança no Supabase.

## O que aparece na tela

**1. Faixa de KPIs novos** (chips com rótulo + valor, cor com significado):
- De `kpis_taxas().taxas`: ERR, Save rate, Share rate, Reach rate — todos em `%` no formato pt-BR.
- De `kpis_taxas().conteudo`: Seguidores/post, Gancho Reels %, Watch Reels (em segundos).
- Chip sem dado disponível fica em cinza com "—" em vez de sumir.

**2. Card "Melhor horário para postar"**
- As 3 primeiras entradas de `best_time_recommendation().melhores`, cada uma como
  "{dia} {faixa} · RX {rx_medio}× · alcance médio {alcance_medio}".
- Sem dados: estado vazio curto ("Ainda sem janelas suficientes para recomendar").

**3. Painel "Alertas / Leitura da semana"**
- Últimos 8 alertas da organização, mais recentes primeiro.
- `kind = 'digest'` → card destaque com título e corpo.
- `kind = 'anomaly'` → linha com ícone de chama.
- Cor pela `severity`: `good` verde, `warn` vermelho, resto neutro.
- Botão "marcar como visto" por item, com atualização otimista da lista.
- Badge no cabeçalho do bloco com a contagem de não-vistos.

**Também:** o rótulo do KPI "Impressões" no Painel passa a ser "Views" (só o texto; o dado é o mesmo).

## Detalhes técnicos

- Hook novo em `src/hooks/useInteligencia.ts`. Esse arquivo já existe com os hooks de Pautas/Cérebro, então os hooks do Painel são **acrescentados** ao mesmo arquivo (`useTaxasPainel`, `useMelhorHorario`, `useAlertas`), sem tocar no que já está lá.
- React Query, `organizationId` de `useOrg()`, `enabled: !!organizationId`, chaves incluindo `organizationId`, `handle` e `dias`.
  - `supabase.rpc('kpis_taxas', { p_org, p_handle: handle, p_dias: dias })`
  - `supabase.rpc('best_time_recommendation', { p_org, p_handle: handle })`
  - `supabase.from('alerts').select('*').eq('organization_id', ...).order('created_at', { ascending: false }).limit(8)`
  - Mutation: `supabase.from('alerts').update({ seen: true }).eq('id', id)` + invalidação da query de alertas.
- O retorno das duas RPCs é `Json`; normalização defensiva (campos podem vir nulos) em funções puras dentro do próprio hook/arquivo de tipos.
- Componente novo `src/components/painel/Inteligencia.tsx` (chips + card de horário + lista de alertas), no mesmo estilo escuro: `.cartao`, `.rotulo`, `.numero`, `.pill-bom/.pill-alerta/.pill-ruim`, `EstadoVazio` e skeletons `esqueleto` durante o carregamento.
- Renderizado em `src/components/painel/Painel.tsx` dentro de uma seção `secao-entrada` (logo após os clusters de KPI), recebendo `dias` e `perfil` já existentes — `perfil` nulo quando "Todos".
- `src/routes/_authenticated/index.tsx` continua apenas montando `Painel`; nenhuma alteração necessária além disso.
- Rótulo "Impressões" → "Views" em `src/components/painel/ClustersKpi.tsx` (somente o Painel; Métricas e Metas ficam como estão).
- Sem recharts: os três blocos são numéricos/lista, gráfico não agrega aqui.

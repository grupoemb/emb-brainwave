# Padronizar views, alcance e salvamentos como k/mi

Hoje o app tem dois formatadores: `compacto()` (em `src/lib/contas.ts`, usado só no Reels Radar, gera "8,4 mil" / "1,2 mi") e `numero()` (em `src/lib/metricas.ts`, gera "8.420"). Por isso o mesmo dado aparece diferente entre Painel, Métricas e Radar.

A mudança é só de apresentação: um único formatador compacto pt-BR aplicado a **views, alcance/impressões e salvamentos/compartilhamentos** em toda a interface, sempre dentro da classe `.numero`.

## Regra de formatação

- < 1.000 → número cheio (ex.: 842)
- ≥ 1.000 → "8,4 mil"
- ≥ 1.000.000 → "1,2 mi"
- nulo → "—"
- Não muda: percentuais, RX/VX (`1,85×`), contagens de posts, prioridades e seguidores em listas de perfil já compactadas.

## Onde aplicar

Reels Radar (já compacto, só passa a usar a função central):
- `TabelaReels.tsx` — views, alcance, salv. e a mediana no cabeçalho
- `CartaoItem.tsx` — views
- `CartaoConta.tsx`, `DrawerConta.tsx`, `RankingReels.tsx` — mantêm o comportamento atual

Painel (home):
- `Podio.tsx` — alcance, alcance médio, salvos, compart., alcance do melhor post e da lista
- `DestaquesPeriodo.tsx` — melhor alcance, mais salvo, mais seguidores
- `Painel.tsx` — rodapé de KPIs (salvos, compart., seguidores)
- `CartaoKpiPainel.tsx` — KPIs de volume (alcance, impressões, interações, saves, shares); percentuais e médias com casas decimais seguem como estão
- `BlocosAnaliticos.tsx` — alcance médio do mapa de calor e alcance do mix de formatos
- `EvolucaoAlcance.tsx` — ticks do eixo e tooltip

Métricas:
- `MapaDeCalor.tsx` — alcance médio nos tooltips e no destaque
- `PainelDrill.tsx` — colunas de alcance, impressões, saves e shares
- Demais gráficos/tabelas de métricas que exibem alcance ou salvamentos (`GraficoAlcance`, `BarrasDimensao`, `BarraComposicao`, `TabelaPosts`, `FunilInteracao`, `ComparativoContas`, `DonutFormatos`) usam o mesmo formatador nos valores de volume

## Detalhes técnicos

- Mover `compacto()` para `src/lib/metricas.ts` (ao lado de `numero()`) e reexportar de `src/lib/contas.ts` para não quebrar os imports do Radar.
- Em tooltips e `title`, manter o valor exato entre parênteses quando o espaço permitir, para não perder precisão.
- Nenhuma mudança de dados, RPC, RLS ou backend.

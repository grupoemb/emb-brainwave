# Reels Radar ("Suas contas") mais útil: filtros, views e mais KPIs

Confirmei no banco que a RPC `public.radar_ranking(p_org, p_dias, p_handle)` já existe e retorna também `watch_s` e `hook_pct` por reel. O trabalho é só de frontend — nada no Supabase.

## 1. Hook do ranking (`src/hooks/useRanking.ts`)

Hoje o hook monta o ranking no cliente (contorno do bug antigo da RPC). Volta a consumir a RPC, agora com filtro:

- Assinatura `useRanking(dias = 90, handle: string | null = null)`.
- Chamada `supabase.rpc('radar_ranking', { p_org: organizationId, p_dias: dias, p_handle: handle })`.
- `queryKey: ["radar-ranking", organizationId, dias, handle]`.
- Normaliza as linhas para o tipo `ReelRanking`, incluindo os dois campos novos.

## 2. Tipo (`src/lib/ranking.ts`)

`ReelRanking` ganha `watch_s: number | null` e `hook_pct: number | null`.

## 3. Painel (`src/components/radar/PainelContas.tsx`)

- Sai a constante `DIAS = 90`; entram estados `dias` (90 inicial) e `perfil` (null = todas). `useRanking(dias, perfil)`.
- Dois controles segmented no cabeçalho:
  - Período: 7 / 14 / 30 / 90.
  - Perfil: "Todas" + um item por handle vindo de `contas` (useContas).
- Textos passam a refletir a escolha: descrição usa `{dias}` e o rótulo do Top 10 mostra o perfil selecionado (ou "todos os perfis") e o período.
- Faixa de KPIs vai de 3 para 6 cards (grid `sm:2 lg:3`), calculados a partir de `reels`:
  Seguidores (KpiSeguidores) · Reels no período · Views médias (`compacto`) · Alcance médio (`compacto`) · Gancho 3s médio (`%`) · Melhor alavanca.
- `LeituraSemana` recebe `dias={dias}`.

## 4. Linha do ranking (`src/components/radar/LinhaRanking.tsx`)

- Linha fechada: views em `.numero` (`compacto`), escondidas no mobile (`hidden sm:block`), antes do score. Score continua sendo o número principal, seguido do PillVx.
- Linha expandida: grid de taxas passa a `sm:grid-cols-3` com 6 itens — as 4 atuais mais "Watch médio" (`Xs`) e "Gancho 3s" (`X%`), com `—` quando nulo.

Visual escuro e classes da fundação (`.cartao`, `.numero`, `.rotulo`, pills) mantidos.

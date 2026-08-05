# Busca por @handle no Painel do Reels Radar

Um campo de busca no Painel para achar um perfil rápido e ver só o Top 3 dele.

## Como funciona

- **Campo de busca** logo acima da seção "Top 3 de cada perfil": ícone de lupa, placeholder "Buscar perfil por @handle…", botão de limpar quando há texto.
- **Filtro ao vivo**: conforme digita, as seções "Top 3 · @handle" mostram só os perfis cujo handle contém o termo (sem diferenciar maiúsculas/minúsculas nem o "@").
- **Foco**: com um único perfil correspondente, ele ocupa a largura toda e ganha um botão "Ver ranking completo" que abre o drawer da conta já existente.
- **Sugestões**: abaixo do campo, chips com todos os handles disponíveis; clicar num chip preenche a busca. Clicar de novo no mesmo chip limpa.
- **Sem resultado**: "Nenhum perfil encontrado para '@termo'." com botão "Limpar busca".
- **Compartilhável**: o termo fica na URL (`?aba=painel&handle=...`), então o link já abre filtrado; a busca também sincroniza com o parâmetro que a rota já aceita.
- O Top 10 geral, os KPIs e a Leitura da semana continuam como estão — a busca afeta apenas o bloco de Top 3 por perfil.

## Detalhes técnicos

- `src/components/radar/PainelContas.tsx`: lê/escreve o search param `handle` (já validado em `src/routes/_authenticated/radar.tsx`) via `useSearch`/`useNavigate` com atualização em função (`{...prev}`) e `replace: true`; filtra `topPorPerfil(reels, 3)` pelo termo normalizado.
- Novo `src/components/radar/BuscaPerfil.tsx`: input controlado no padrão visual da fundação (`.cartao`, borda `line`, foco azure), chips de handles e botão limpar. Sem debounce (filtro é client-side sobre dados já carregados).
- Reaproveita `DrawerConta` para o "Ver ranking completo"; nenhum hook, RPC, tabela ou migration nova.

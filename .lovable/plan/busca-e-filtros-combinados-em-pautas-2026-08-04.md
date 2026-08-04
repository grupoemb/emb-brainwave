# Busca e filtros combinados em /pautas

Adicionar uma barra de busca e filtros que funcionam juntos (status + tipo + pilar + texto), para localizar uma pauta em segundos.

## O que muda na tela

Abaixo do cabeçalho, uma linha de controles:

- **Campo de busca** com ícone de lupa e botão de limpar. Filtra por título e também pelo texto do "porquê" (rationale), sem diferenciar acentos nem maiúsculas.
- **Chips de status** (já existem): Novas / Aceitas / Descartadas, com contagem.
- **Chips de tipo**: Todos · Pauta · Melhoria · Formato · Horário · Alerta — cada um com a contagem dentro do recorte atual.
- **Chip de pilar**: "Todos os pilares" + um chip por pilar presente nas pautas, com a cor do pilar.
- Todos os filtros se combinam; a contagem de cada chip reflete os outros filtros ativos.
- **Resumo + limpar**: quando algum filtro além do status estiver ativo, mostra "N pautas" e um botão discreto "Limpar filtros".

Estados vazios ficam mais específicos: se a busca/filtro não encontrar nada, aparece "Nenhuma pauta encontrada com esses filtros." em vez da mensagem de rodada semanal.

No mobile os chips rolam horizontalmente, como nas outras telas.

## Detalhes técnicos

- Filtros vivem na URL da rota `/pautas` via `validateSearch` + `zodValidator` com `fallback`: `q` (texto), `status`, `tipo`, `pilar`. Assim o estado sobrevive a recarregar/compartilhar link e o botão voltar funciona.
- `usePautas` passa a ler os valores de `Route.useSearch()` e escrever com `useNavigate({ search: prev => ... })`, substituindo o `useState` do filtro atual. Toda a filtragem continua no cliente sobre a lista já carregada — nenhuma nova chamada ao servidor, nenhuma mudança no banco.
- Normalização de texto com `String.normalize("NFD")` para busca sem acento.
- Novo componente `src/components/pautas/FiltrosPautas.tsx` com o campo de busca e os grupos de chips; `Pautas.tsx` só o consome.
- Sem alterações em `src/lib/inteligencia.functions.ts`, no schema, em RLS ou em migrations.

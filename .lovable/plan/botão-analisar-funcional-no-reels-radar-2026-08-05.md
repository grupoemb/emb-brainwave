# Botão "Analisar" funcional no Reels Radar

O campo "Colar link do perfil" hoje é decorativo e a tabela "Reels encontrados" está sempre vazia. Esta mudança liga a coleta real à Edge Function `radar_scan` já existente e permite enviar os reels escolhidos para a Biblioteca via `library_add`.

## Fluxo

1. **Analisar** — o clique chama `radar_scan` com `organization_id` (do `useOrg`) e `profile_url`. Enquanto roda (30–90s), o botão fica desabilitado com spinner e aparece um bloco paciente: "Coletando os reels de @handle… isso leva até 1 minuto", com uma barra de progresso indeterminada e um contador de segundos decorridos, para não parecer travado.
2. **Retornos**
   - Sucesso: preenche a tabela com `reels`, guarda `handle`, `count` e `median`.
   - 404: toast de erro "Perfil não encontrado ou sem reels públicos."
   - 500/502/503 e falhas de rede: cartão de erro com borda esquerda coral (`--ruim`) mostrando a mensagem real devolvida pela função, com botão "Tentar de novo".
3. **Tabela "Reels encontrados"** — cabeçalho "@handle · N reels · mediana X views". Colunas: checkbox (marcar/desmarcar todos no cabeçalho), capa 32×42 arredondada (fallback quando não houver `cover`), legenda truncada em 1 linha, views em `.numero`, pill de VX (verde ≥ 1.3, neutra 0.7–1.3, coral < 0.7, com ícone flame quando ≥ 2) e duração formatada "0:59". Os 5 primeiros já vêm marcados.
4. **Envio à Biblioteca** — abaixo da tabela, campo "Nicho" e botão `.btn-primario` "Adicionar N à Biblioteca". Envia um `library_add` por vez, em sequência, mostrando "salvando 2 de 5…" e desabilitando os controles. Ao final: toast "N reels na Biblioteca", limpa a seleção e recarrega as consultas da Biblioteca. Se algum item falhar, o loop continua e o toast final informa quantos falharam.
5. **Adicionar item manual** continua no mesmo lugar como alternativa.

Estados vazios e o texto informativo atual são ajustados para refletir que a coleta automática existe.

## Detalhes técnicos

- `src/lib/radar.ts` (novo): tipos `ReelColetado`/`RespostaScan`, `classeVx`, `formatarDuracao` e normalização da resposta da função.
- `src/hooks/useRadarScan.ts` (novo): `useMutation` chamando `supabase.functions.invoke("radar_scan", ...)`, traduzindo status HTTP em mensagens, e `useEnviarBiblioteca` com envio sequencial + estado de progresso (`{ atual, total }`), invalidando `["biblioteca"]` e `["biblioteca-insights"]`.
- `src/components/radar/RadarColeta.tsx`: passa a orquestrar estado (resultado, seleção `Set<string>`, nicho, erro) e renderiza o carregando, o cartão de erro e a nova tabela.
- `src/components/radar/TabelaReels.tsx` (novo): tabela com checkboxes, pills de VX e capas.
- Sem migrations, sem novas Edge Functions; tudo autenticado pelo cliente do browser, respeitando o RLS.

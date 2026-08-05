# Corrigir o painel vazio em Métricas

## Diagnóstico confirmado

Os dados existem e a consulta publicada responde com sucesso. O vazio é causado pela animação de entrada: `.secao-entrada` começa com `opacity: 0`, enquanto `Revelar` consulta e anima os elementos apenas na primeira montagem. Os blocos de métricas são adicionados depois que a consulta termina e, portanto, permanecem invisíveis.

## Implementação

1. Tornar `Revelar` compatível com conteúdo assíncrono, observando novos elementos `.secao-entrada` inseridos após a montagem e revelando cada elemento uma única vez.
2. Preservar o movimento atual (fade, subida de 14 px, 0,42 s e stagger) e o comportamento de `prefers-reduced-motion`.
3. Adicionar tratamento explícito de erro no hook/tela de Métricas, para que falhas futuras mostrem um estado de erro com ação de tentar novamente em vez de uma área vazia.
4. Alinhar o período aceito entre Home e Métricas, incluindo 14 dias no tipo, filtro e validação do servidor, evitando falha ao abrir links do Painel com esse recorte.

## Validação

- Confirmar no preview autenticado que KPIs, abas, gráficos e tabela aparecem após o carregamento.
- Testar 7, 14, 30 e 90 dias, comparação com período anterior e atualização manual.
- Verificar que estados de carregamento, vazio e erro ficam visíveis e que nenhuma seção permanece com opacidade zero.
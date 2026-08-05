# Menu de seleção acima dos campos no diálogo de metas

## Problema

O diálogo (`DialogContent`) e o menu do select (`SelectContent`) estão ambos em `z-50`. Com camadas iguais, o menu não fica claramente acima do diálogo e, em telas menores, ele ainda é ancorado de forma a cobrir os campos logo abaixo do gatilho.

## Ajustes (apenas `src/components/ui/select.tsx`)

1. Elevar a camada do menu para `z-[60]`, acima do overlay e do conteúdo do diálogo (`z-50`), garantindo que ele sempre desenhe por cima em vez de disputar empilhamento.
2. Manter `position="popper"` e reforçar o posicionamento ancorado:
   - `sideOffset` padrão de 4px para separar do campo;
   - `collisionPadding` de 8px para o menu virar para cima quando não houver espaço abaixo, em vez de invadir os campos seguintes;
   - `max-h` limitado à altura disponível (`--radix-select-content-available-height`) com rolagem interna.
3. Corrigir a altura fixa aplicada ao viewport em modo popper (`h-[var(--radix-select-trigger-height)]`), que recorta a lista; a largura mínima do gatilho é mantida.

O mesmo ajuste vale para todos os selects do app (metas, filtros, ajustes), já que o componente é compartilhado. Nenhuma alteração de backend ou de lógica de metas.

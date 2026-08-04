# Barra de filtros de Métricas em menus suspensos

A fileira de chips hoje empilha Período, Conta, Pilar e Comparar na mesma linha, o que força rolagem horizontal e corta os itens (como na captura). A proposta troca essa fileira por quatro botões-gatilho compactos, cada um abrindo um painel elegante com as opções.

## Como fica

Uma barra única, sem rolagem horizontal, com quatro gatilhos lado a lado:

```text
[ Período · 30 dias v ] [ Conta · Todas v ] [ Pilar · Todos v ] [ Comparar · Desligado v ]      coletado há 16min  [Atualizar]
```

Cada gatilho mostra o rótulo pequeno em maiúsculas (estilo .rotulo) e, embaixo ou ao lado, o valor selecionado em destaque, com um chevron. Ao clicar, abre um painel (popover) ancorado ao botão:

- **Período**: 7 / 30 / 90 dias como linhas selecionáveis com check à direita.
- **Conta**: "Todas" no topo, separador, e a lista de @handles com ícone do canal e check no ativo; ganha campo de busca quando houver mais de 6 contas.
- **Pilar**: "Todos" no topo, separador, e cada pilar com o ponto colorido + nome.
- **Comparar**: Desligado / Período anterior / Personalizado; ao escolher Personalizado, os dois campos de data aparecem dentro do próprio painel, não mais numa linha extra abaixo.

Detalhes de acabamento: painel com fundo `--card`, borda `--line`, raio .7rem, sombra do `.cartao`, itens com hover em branco 6%, item ativo com fundo azure 14% e texto branco, animação de abertura curta (fade + 4px), fechamento no Esc e no clique fora, navegação por teclado. Filtro fora do padrão fica com o gatilho marcado em azure para ficar claro que há recorte aplicado.

No mobile a barra quebra em duas linhas de dois gatilhos, e o bloco "coletado há … / Atualizar" vai para baixo, alinhado à esquerda.

## Detalhes técnicos

- Reescrever `src/components/metricas/FiltrosMetricas.tsx` usando `@/components/ui/popover` (já instalado, Radix) — mantendo exatamente as mesmas props e callbacks (`dias`, `conta`, `pilar`, `comparacao`, `customDesde`, `customAte`, `atualizar`), sem mexer em hooks, dados ou URL/search params.
- Criar dois auxiliares locais no mesmo arquivo: `GatilhoFiltro` (botão com rótulo + valor + chevron + estado "ativo") e `ItemOpcao` (linha com check, usada nos quatro painéis).
- Busca da lista de contas é apenas filtro visual em memória, sem novas consultas.
- Nenhuma mudança em `Metricas.tsx`, hooks ou banco; nenhum token novo — só as variáveis e classes já existentes (`.cartao`, `.rotulo`, azure/line/muted).

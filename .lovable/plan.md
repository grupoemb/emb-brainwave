# Padronizar marca B7 nos estados vazios, erro e carregamento

Hoje o logotipo aparece só no login, na sidebar e no cabeçalho do Painel. Os estados vazios, de erro e de carregamento usam três padrões diferentes (`EstadoVazio`, `VazioFiltrado` e blocos soltos em cada tela), com marca-d'água ausente e cores fora dos tokens. A ideia é ter um único conjunto visual de marca para todos esses momentos.

## O que muda

**1. Token do dourado da marca**
Adicionar `--dourado` (o amarelo do arco do logotipo) em `src/styles.css` e expô-lo como cor Tailwind (`dourado`). Hoje esse valor é reaproveitado do token `--alerta`, o que mistura "aviso" com "marca".

**2. Marca-d'água padrão**
Novo componente `MarcaB7` (variação discreta do logotipo: baixa opacidade, halo azure suave), usado como elemento visual de fundo dos estados vazios e de erro grandes. Nada de animação em loop.

**3. `EstadoVazio` unificado**
- Passa a aceitar `variante`: `vazio` (padrão), `erro` e `filtro`.
- `vazio`: marca-d'água B7 + ícone em círculo azure a 12% com texto azure-claro.
- `erro`: mesma estrutura, borda e ícone em `ruim`, botão "Tentar de novo".
- `filtro`: versão compacta com atalho para limpar o recorte.
- `VazioFiltrado` vira um invólucro fino sobre `EstadoVazio variante="filtro"`, mantendo a API atual para não quebrar as telas que já o usam.

**4. Carregamento com assinatura da marca**
- `.esqueleto` ganha o brilho de varredura no azure da marca em vez do branco neutro atual.
- Novo `CarregandoTela` (logotipo B7 discreto + rótulo "Carregando…") para carregamentos de página inteira/rota, com `prefers-reduced-motion` desligando o brilho.

**5. Aplicar nas telas**
Trocar as mensagens soltas de vazio/erro/carregando por esses componentes em: Painel, Kanban, Calendário, Post, Métricas (incluindo Benchmark, TabelaPosts, ComparativoContas), Pautas, Cérebro (incluindo "O que a audiência pede"), Criar, Radar/Biblioteca e todas as abas de Ajustes.

**6. Logotipo consistente**
Mesma altura e alinhamento do logotipo nos três pontos onde já aparece (login, sidebar, cabeçalho do Painel) e nos novos estados, sempre via `LogoB7`/`MarcaB7` — sem cópias soltas do arquivo de imagem.

## Detalhes técnicos

- `src/styles.css`: token `--dourado`, mapeamento `--color-dourado`, ajuste do gradiente de `.esqueleto` para azure e regra `prefers-reduced-motion`.
- Novos arquivos: `src/components/ui/MarcaB7.tsx`, `src/components/ui/CarregandoTela.tsx`.
- Alterados: `src/components/ui/EstadoVazio.tsx`, `src/components/filtros/VazioFiltrado.tsx`, `src/components/conteudo/Esqueleto.tsx` e as telas listadas acima.
- Só frontend: sem mudanças em Supabase, queries, RLS ou regras de negócio.

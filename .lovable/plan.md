# Logotipo oficial B7 na identidade do app

Aplicar o logotipo enviado (wordmark branco com o arco dourado) nos pontos onde hoje existe apenas um lockup de texto, mantendo hierarquia visual e sem poluir as telas internas.

## O que muda

### 1. Tela de acesso (/auth) — ponto principal
- O bloco de texto "B7 · Central de Conteúdo" dá lugar ao logotipo oficial, centralizado no topo do cartão de vidro, com largura controlada (aprox. 180px) e respiro generoso acima e abaixo.
- Abaixo do logo, em tipografia menor e discreta, o rótulo "Central de Conteúdo" como subtítulo — o logo passa a ser o elemento dominante e o nome do produto vira apoio.
- A frase muda para: "Cérebro artificial para criação, gestão e análises de conteúdo para redes sociais. Acesso restrito à equipe B7."
- Os chips Instagram · LinkedIn · TikTok permanecem, logo abaixo da frase.
- A entrada animada existente continua valendo (fade + subida), sem loop.

### 2. Sidebar (todas as telas internas)
- O quadradinho gradiente "B7" é substituído pelo logotipo em versão reduzida (altura ~18px), alinhado à esquerda no topo de 56px, seguido do divisor vertical sutil e do texto "Central de Conteúdo" em text-sm.
- Na sidebar colapsada/drawer o comportamento de truncar continua igual.

### 3. Painel (/) — assinatura leve
- No cabeçalho do Painel, o logotipo aparece em tamanho pequeno alinhado à direita do bloco de saudação, como assinatura da ferramenta — sem competir com o título da página.

### 4. Favicon
- Gerar um favicon quadrado a partir do arco dourado do logotipo e apontar o `<link rel="icon">` para ele, substituindo o favicon padrão.

## Detalhes técnicos

- O arquivo enviado vira um asset de CDN via `lovable-assets` (`src/assets/logo-b7.png.asset.json`), importado como pointer JSON nos componentes — o binário não fica no repositório.
- Componente novo `src/components/ui/LogoB7.tsx` com prop de altura e `alt="B7"`, para uso consistente nos três lugares.
- Arquivos tocados: `src/routes/auth.tsx`, `src/components/AppShell.tsx` (função `Marca`), `src/components/painel/Painel.tsx`, `src/routes/__root.tsx` (favicon), `public/favicon.png`.
- Nenhuma mudança de backend, dados ou rotas.

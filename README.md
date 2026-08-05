# Central de Conteúdo B7

Projeto: "Central de Conteúdo EMB" — ferramenta interna de gestão de conteúdo
com IA. Tema escuro único (sem modo claro). Idioma: PT-BR.
Instale: gsap, recharts, lucide-react. Fontes Google: Geist (interface) e
Montserrat (números e rótulos).

O Supabase já está conectado e o banco JÁ EXISTE. NÃO crie tabelas, NÃO crie
edge functions, NÃO rode migrations. Apenas leia/escreva nas tabelas
existentes respeitando o RLS.

1) TOKENS — em src/index.css, crie estas CSS variables e exponha todas como
cores no Tailwind (nomes: bg, bg2, card, card2, line, lineForte, txt, corpo,
muted, azure, azureClaro, cyan, royal, bom, alerta, ruim):
--bg:#0a1020; --bg-2:#0e1626; --card:#121b2d; --card-2:#16223a;
--line:rgba(148,163,184,.16); --line-forte:rgba(148,163,184,.30);
--txt:#e9eef7; --corpo:#b9c6d8; --muted:#8294ab;
--azure:#00a4ff; --azure-claro:#66c7ff; --cyan:#00e7ff; --royal:#0068c9;
--bom:#3ecf8e; --alerta:#f6bd24; --ruim:#ff7a6b.
body: fundo --bg, texto --txt, Geist, line-height 1.55, antialiased.
h1-h3: letter-spacing -0.02em, line-height 1.12.
::selection: fundo azure com texto branco.
:focus-visible: outline 2px azure com offset 3px.

2) CLASSES utilitárias (@layer components):
.cartao = fundo var(--card), borda 1px var(--line), raio .9rem,
  sombra "0 10px 34px -18px rgb(0 0 0 / .6)"
.numero = Montserrat 600, font-variant-numeric tabular-nums,
  letter-spacing -.015em, line-height 1.1
.rotulo = Montserrat 700, .72rem, uppercase, letter-spacing .11em, cor muted
.grad = texto com gradiente linear 100deg de var(--azure) a var(--cyan)
  (background-clip: text)
.btn = botão discreto: borda var(--line), raio .55rem, texto --corpo,
  hover fundo branco a 6%
.btn-primario = gradiente linear 100deg de var(--royal) a var(--azure),
  texto branco, raio .55rem, font-medium
.pill = raio 999px, .72rem, padding 2px 10px
.pill-bom = texto #3ecf8e fundo rgba(62,207,142,.13)
.pill-alerta = texto #f6bd24 fundo rgba(246,189,36,.14)
.pill-ruim = texto #ff7a6b fundo rgba(255,122,107,.12)

3) LAYOUT (casca do app, com react-router):
- Sidebar fixa w-64, fundo --bg-2, borda direita var(--line). Topo h-14 com
  "B7 · Central de Conteúdo" (font-bold; "Central" pode usar .grad em uma
  palavra no máximo). Navegação: Painel (/), Calendário (/calendario),
  Kanban (/kanban), Criar (/criar), Métricas (/metricas), Pautas (/pautas),
  Cérebro (/cerebro), Concorrentes (/concorrentes), Ajustes (/ajustes).
  Item: ícone lucide 16px + texto text-sm, raio .5rem, padding 8px 12px;
  ativo = fundo azure a 14% + texto branco + font-semibold;
  inativo = texto muted, hover texto --corpo.
  "Concorrentes" desativado: opacity-45, cursor-not-allowed, title "Em breve".
- Abaixo do breakpoint lg a sidebar vira drawer (overlay bg-black/60,
  hamburger no header).
- Header h-14 com borda inferior var(--line): título da página à esquerda;
  à direita avatar de iniciais (h-9 w-9 rounded-full, fundo azure a 15%,
  texto azure-claro, text-xs font-bold).
- Main: px-4 py-5 lg:px-6, conteúdo em max-w-[1500px] mx-auto,
  overflow-x-clip no container.
- Cada rota renderiza por enquanto: título text-lg font-bold + um .cartao p-8
  com "Módulo em construção" em texto muted.

4) MOVIMENTO: entrada única de seções com fade + subida de 14px, 0.42s,
cubic-bezier(.23,1,.32,1), stagger 45ms. prefers-reduced-motion desliga tudo.
PROIBIDO: animação em loop, fundo animado, parallax.

5) NÃO FAZER: não usar localStorage para dados de negócio; nenhuma chave no
código além da configuração da integração; não criar modo claro; não criar
telas de marketing/landing — isso é uma ferramenta interna.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://emb-brainwave.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/862b9caa-f4f0-4664-9924-73f1091d96d9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

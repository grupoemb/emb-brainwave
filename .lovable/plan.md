# Login (/auth) — vitrine de dados

Redesenho completo apenas da tela `/auth`. Nenhuma mudança em Painel, backend, tabelas ou na lógica de login/cadastro/código de acesso — o formulário continua fazendo exatamente o que já faz hoje.

## A ideia

Em vez de um card cinza solto no meio do escuro, a tela vira uma **vitrine do produto**: atrás do formulário, uma malha de mini-cards reais da Central (KPI de alcance, sparkline, coluna de kanban, pill de "fora da curva", donut de formatos) flutua desfocada, em profundidade, com o gradiente azure→cyan varrendo o fundo. A pessoa vê o valor da ferramenta antes de digitar a senha.

Os mini-cards são **decorativos e estáticos** (números fictícios plausíveis, marcados como `aria-hidden`) — nada de consulta ao banco em tela pública.

## Composição

```text
┌──────────────────────────────────────────────────────┐
│  halo azure                                          │
│   ┌───── vitrine desfocada (cards flutuando) ─────┐  │
│   │  [KPI]      ┌───────────────────┐    [donut]  │  │
│   │   [spark]   │   CARD DE ACESSO  │   [kanban]  │  │
│   │  [pill rx]  │   (nítido, glass) │    [flame]  │  │
│   └─────────────┴───────────────────┴─────────────┘  │
│         "3 contas · 1 lugar · zero achismo"          │
└──────────────────────────────────────────────────────┘
```

- **Desktop (lg+)**: vitrine ocupa a largura toda, cards espalhados nas laterais em 3 profundidades (blur 2/6/12px, opacidade 55/32/18%), o card de acesso centralizado por cima.
- **Mobile**: vitrine reduz para uma faixa suave no topo e no rodapé; o card de acesso ocupa a tela. Sem scroll horizontal.

## O card de acesso

- Vidro escuro: `bg-card/80` + `backdrop-blur-xl`, borda `--line-forte`, raio 1.1rem, sombra profunda e um fio de luz azure na borda superior.
- Cabeçalho com a marca **B7 · Central de Conteúdo** (Central em `.grad`), subtítulo "Acesso restrito à equipe EMB" e três selos discretos: Instagram · LinkedIn · TikTok.
- Alternador Entrar / Criar conta vira um **segmented control** com pastilha deslizante (translate animado), não troca brusca de cor.
- Campos redesenhados: label flutuante em `.rotulo`, ícone lucide à esquerda (mail, lock, users), foco com anel azure suave e transição de borda. Senha ganha botão olho (mostrar/ocultar).
- Campo "Código de acesso da equipe" só aparece na aba **Criar conta**, com microcopy "peça o código à equipe" — hoje ele aparece sempre e confunde quem só quer entrar.
- Botão principal vira `.btn-primario` de largura total, com estado de carregando (spinner + "Aguarde…") e leve elevação no hover.
- Erros em bloco de alerta com ícone e fundo `ruim` a 10%, com aparição animada — não mais um texto solto vermelho.
- Rodapé do card: "Uso interno · dados protegidos por RLS" com ícone de escudo.

## Movimento (nível 4, respeitando `prefers-reduced-motion`)

- Entrada: halo e vitrine em fade, card sobe 14px com o easing padrão do app; stagger de 45ms nos campos.
- Gradiente do halo com deslocamento lento e contínuo, bem sutil, atrás de blur pesado — sem fundo piscante nem parallax de scroll.
- Cards da vitrine com flutuação vertical mínima (4–8px, ciclos longos e dessincronizados).
- Hover no botão e nos campos com transição de 200ms.
- Com `prefers-reduced-motion: reduce`, tudo fica estático — só o estado de foco permanece.

## Notas técnicas

- `src/routes/auth.tsx`: apenas a camada de apresentação é reescrita. `enviar()`, `traduzirErro()`, o redirect do `getSession` e a chamada a `entrarNaOrganizacao` ficam idênticos. O `head()` permanece.
- Novos componentes em `src/components/acesso/`: `VitrineFundo.tsx` (malha decorativa) e `CampoAcesso.tsx` (input com ícone, label e olho de senha).
- Só tokens existentes (`bg`, `bg2`, `card`, `line`, `lineForte`, `azure`, `azureClaro`, `cyan`, `royal`, `bom`, `alerta`, `ruim`) e as classes `.cartao`, `.numero`, `.rotulo`, `.grad`, `.btn-primario`, `.pill`.
- Keyframes novos (halo e flutuação) entram em `src/styles.css` com o bloco de `prefers-reduced-motion` já usado no projeto.
- Sem novas dependências.

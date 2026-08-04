# Skeletons e estados de carregamento

Substituir os textos "Carregando…" por placeholders com a forma real do conteúdo, para o layout não pular nem piscar ao abrir um post.

## O que muda

**Mídia (previews com signed URL)**
- Enquanto a lista de arquivos carrega: grade de 3 blocos com a mesma altura dos cards (h-28), em tom de superfície.
- Cada preview de imagem/vídeo ganha placeholder próprio até a signed URL carregar de fato: o bloco só troca para a imagem depois do `onLoad`, e cai no cartão de arquivo genérico se a URL falhar (`onError`) — evita o "flash" de imagem quebrada.
- Durante o upload, um card placeholder extra aparece ao final da grade com o nome do arquivo, sumindo quando o registro chega.

**Lista de versões**
- Enquanto carrega: 3 linhas placeholder com bolinha de avatar, faixa de título e faixa de data, dentro da mesma borda das linhas reais.

**Trilha de aprovação**
- Enquanto carrega: pill de estado como bloco cinza e 2 linhas placeholder de trilha (avatar + duas faixas).
- Os botões de decisão ficam desabilitados enquanto a trilha ainda não carregou e enquanto uma decisão está sendo gravada (evita clique duplo).

**Tela do post inteira**
- Enquanto o post carrega: esqueleto do layout completo (cabeçalho, bloco do corpo, grade de campos, coluna lateral) na mesma grade 2/3 + 1/3, em vez do texto "Carregando post…".

## Detalhes técnicos

- Novo componente `src/components/conteudo/Esqueleto.tsx`: `<Esqueleto className="h-4 w-24" />` — div com `bg-white/6`, raio herdado por classe. Sem animação em loop (regra do projeto proíbe loops/fundo animado); a distinção visual vem do tom, não de shimmer.
- Novo `PostDetalheEsqueleto` no mesmo arquivo ou junto de `PostDetalhe.tsx`, usado quando `carregando` é verdadeiro.
- `MidiaPost.tsx`: estado local `carregadas: Set<id>` para controlar o fade-in de cada preview; `enviando` passa a guardar os nomes dos arquivos em voo para render dos cards placeholder.
- `LateralPost.tsx`: blocos de esqueleto nas duas abas, substituindo os textos atuais de carregamento; `disabled` nos botões via `decidir.isPending`.
- A entrada de seções (fade + subida) continua rodando uma vez; o esqueleto usa as mesmas classes de cartão para não alterar altura ao trocar pelo conteúdo real.
- Nenhuma mudança em consultas, server functions ou banco.

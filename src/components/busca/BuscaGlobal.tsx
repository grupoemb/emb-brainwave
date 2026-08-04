import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, FileText, Lightbulb, Compass, CornerDownLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useOrg } from "@/hooks/useOrg";
import { buscaGlobal } from "@/lib/busca.functions";
import { ROTULO_STATUS, type Status } from "@/lib/conteudo";
import { TODOS_ITENS } from "@/lib/navegacao";

type Resultado = {
  chave: string;
  grupo: "Páginas" | "Posts" | "Pautas";
  titulo: string;
  detalhe: string;
  icone: typeof FileText;
  ir: () => void;
};

function normalizar(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function useAtalho(abrir: () => void) {
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        abrir();
      }
      const alvo = e.target as HTMLElement | null;
      const digitando =
        !!alvo &&
        (alvo.tagName === "INPUT" ||
          alvo.tagName === "TEXTAREA" ||
          alvo.isContentEditable);
      if (k === "/" && !digitando && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        abrir();
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [abrir]);
}

/** Botão do header que abre a busca global (Cmd/Ctrl + K ou "/"). */
export function BuscaGlobal() {
  const [aberto, setAberto] = useState(false);
  useAtalho(() => setAberto(true));

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        title="Buscar (Ctrl + K)"
        aria-label="Buscar pautas, posts e páginas"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[.6rem] border border-line text-muted transition-colors hover:border-lineForte hover:text-corpo sm:flex sm:h-9 sm:w-auto sm:min-w-[15rem] sm:justify-start sm:gap-2 sm:px-3"
      >
        <Search size={15} className="shrink-0" />
        <span className="hidden truncate text-xs sm:block">Buscar pautas, posts, páginas…</span>
        <kbd className="ml-auto hidden rounded-[.35rem] border border-line px-1.5 py-0.5 font-mono text-[.62rem] text-muted sm:block">
          ⌘K
        </kbd>
      </button>

      {aberto ? <PainelBusca aoFechar={() => setAberto(false)} /> : null}
    </>
  );
}

function PainelBusca({ aoFechar }: { aoFechar: () => void }) {
  const navigate = useNavigate();
  const { organizationId } = useOrg();
  const buscar = useServerFn(buscaGlobal);
  const [termo, setTermo] = useState("");
  const [debounced, setDebounced] = useState("");
  const [indice, setIndice] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    campo.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(termo.trim()), 220);
    return () => clearTimeout(t);
  }, [termo]);

  const { data, isFetching } = useQuery({
    queryKey: ["busca-global", organizationId, debounced],
    queryFn: () => buscar({ data: { organizationId: organizationId!, termo: debounced } }),
    enabled: !!organizationId && debounced.length >= 2,
    staleTime: 30_000,
  });

  const resultados = useMemo<Resultado[]>(() => {
    const alvo = normalizar(termo.trim());

    const paginas: Resultado[] = TODOS_ITENS.filter((i) => !i.desativado)
      .filter((i) => {
        if (!alvo) return true;
        const campos = [i.rotulo, i.subtitulo, ...(i.sinonimos ?? [])].map(normalizar);
        return campos.some((c) => c.includes(alvo));
      })
      .slice(0, alvo ? 5 : 9)
      .map((i) => ({
        chave: `pagina-${i.to}`,
        grupo: "Páginas" as const,
        titulo: i.rotulo,
        detalhe: i.subtitulo,
        icone: i.icone,
        ir: () => navigate({ to: i.to }),
      }));

    const posts: Resultado[] = (data?.posts ?? []).map((p) => ({
      chave: `post-${p.id}`,
      grupo: "Posts" as const,
      titulo: p.title || "Sem título",
      detalhe: [ROTULO_STATUS[p.status as Status] ?? p.status, p.channel, p.format]
        .filter(Boolean)
        .join(" · "),
      icone: FileText,
      ir: () => navigate({ to: "/post/$id", params: { id: p.id } }),
    }));

    const pautas: Resultado[] = (data?.pautas ?? []).map((s) => ({
      chave: `pauta-${s.id}`,
      grupo: "Pautas" as const,
      titulo: s.title,
      detalhe: s.converted_post_id ? "Virou post" : "Pauta " + s.status,
      icone: Lightbulb,
      ir: () =>
        s.converted_post_id
          ? navigate({ to: "/post/$id", params: { id: s.converted_post_id } })
          : navigate({ to: "/pautas", search: { busca: s.title } as never }),
    }));

    return [...paginas, ...posts, ...pautas];
  }, [termo, data, navigate]);

  useEffect(() => {
    setIndice(0);
  }, [resultados.length]);

  function escolher(r: Resultado | undefined) {
    if (!r) return;
    r.ir();
    aoFechar();
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      aoFechar();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setIndice((i) => {
        const n = resultados.length;
        if (!n) return 0;
        const prox = e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n;
        lista.current
          ?.querySelectorAll("[data-item]")
          [prox]?.scrollIntoView({ block: "nearest" });
        return prox;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      escolher(resultados[indice]);
    }
  }

  let grupoAtual = "";

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Fechar busca"
        className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
        onClick={aoFechar}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
        onKeyDown={aoTeclar}
        className="cartao absolute left-1/2 top-[9vh] flex max-h-[70vh] w-[min(42rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-hidden bg-card2 p-0 shadow-[0_30px_80px_-30px_rgb(0_0_0/.85)]"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={campo}
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar pautas, posts e páginas…"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-txt outline-hidden placeholder:text-muted"
          />
          {isFetching ? <Loader2 size={14} className="shrink-0 animate-spin text-muted" /> : null}
          <kbd className="hidden rounded-[.35rem] border border-line px-1.5 py-0.5 font-mono text-[.62rem] text-muted sm:block">
            esc
          </kbd>
        </div>

        <div ref={lista} className="flex-1 overflow-y-auto py-2">
          {resultados.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {termo.trim().length < 2
                ? "Digite ao menos 2 letras para buscar posts e pautas."
                : `Nada encontrado para “${termo.trim()}”.`}
            </p>
          ) : (
            resultados.map((r, i) => {
              const Icone = r.icone;
              const novoGrupo = r.grupo !== grupoAtual;
              grupoAtual = r.grupo;
              const ativo = i === indice;

              return (
                <div key={r.chave}>
                  {novoGrupo ? <p className="rotulo px-4 pb-1 pt-3">{r.grupo}</p> : null}
                  <button
                    data-item
                    type="button"
                    onMouseEnter={() => setIndice(i)}
                    onClick={() => escolher(r)}
                    className={
                      "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors " +
                      (ativo ? "bg-azure/12" : "hover:bg-white/4")
                    }
                  >
                    <span
                      className={
                        "grid h-7 w-7 shrink-0 place-items-center rounded-[.5rem] " +
                        (ativo ? "bg-azure/20 text-azureClaro" : "bg-white/5 text-muted")
                      }
                    >
                      <Icone size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-txt">{r.titulo}</span>
                      {r.detalhe ? (
                        <span className="block truncate text-[.72rem] text-muted">{r.detalhe}</span>
                      ) : null}
                    </span>
                    {ativo ? (
                      <CornerDownLeft size={13} className="shrink-0 text-muted" />
                    ) : (
                      <span />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[.68rem] text-muted">
          <Compass size={12} />
          <span>↑ ↓ navegar · Enter abrir · Esc fechar</span>
        </div>
      </div>
    </div>
  );
}

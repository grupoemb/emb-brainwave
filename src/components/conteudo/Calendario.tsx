import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { toastDesfazer } from "@/lib/toastDesfazer";

import { Revelar } from "@/components/Revelar";
import { SemanaEsqueleto } from "@/components/conteudo/Esqueleto";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePilares, usePosts, useAgendar } from "@/hooks/useConteudo";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import {
  CANAIS,
  COLUNAS,
  ROTULO_STATUS,
  corDoCanal,
  type Canal,
  type Post,
  type Status,
} from "@/lib/conteudo";

const SEM_DATA_STATUS: Status[] = ["idea", "script", "design", "review", "approved"];

/** ISO do meio-dia (America/Sao_Paulo, UTC-3) do dia informado. */
function meioDiaSP(dia: Date) {
  const d = format(dia, "yyyy-MM-dd");
  return new Date(`${d}T12:00:00-03:00`).toISOString();
}

/** Mantém a hora original, trocando apenas a data. */
function trocarDia(iso: string, dia: Date) {
  const antigo = new Date(iso);
  const novo = new Date(dia);
  novo.setHours(antigo.getHours(), antigo.getMinutes(), 0, 0);
  return novo.toISOString();
}

function Chip({
  ativo,
  children,
  onClick,
}: {
  ativo: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "h-[30px] shrink-0 rounded-[8px] border border-line px-3 text-xs transition-colors " +
        (ativo ? "bg-azure/16 font-medium text-white" : "text-muted hover:text-corpo")
      }
    >
      {children}
    </button>
  );
}

function Pill({
  post,
  onClick,
  onDragStart,
}: {
  post: Post;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <button
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={post.title}
      className="flex h-6 w-full items-center gap-1.5 rounded-[6px] bg-card2 px-1.5 text-left text-xs text-corpo hover:bg-white/6"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: corDoCanal(post.channel) }}
      />
      <span className="truncate">{post.title}</span>
    </button>
  );
}

export function Calendario() {
  useRealtimePosts();
  const { foco, origem } = useSearch({ from: "/_authenticated/calendario" });
  const { posts, carregando } = usePosts();
  const { pilares, pilarPorId } = usePilares();
  const agendar = useAgendar();

  const doPainel = origem === "painel";
  const foco7d = foco === "7d";

  const [visao, setVisao] = useState<"mes" | "semana">(foco7d ? "semana" : "mes");
  const [referencia, setReferencia] = useState(new Date());
  const [canal, setCanal] = useState<Canal | null>(null);
  const [pilar, setPilar] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const navigate = useNavigate();
  const [diaSobre, setDiaSobre] = useState<string | null>(null);

  const limparRecorte = () =>
    void navigate({ to: "/calendario", search: { foco: "", origem: "" } });

  const filtrados = useMemo(
    () =>
      posts.filter(
        (p) =>
          (!canal || p.channel === canal) &&
          (!pilar || p.pillar_id === pilar) &&
          (!status || p.status === status),
      ),
    [posts, canal, pilar, status],
  );

  const dias = useMemo(() => {
    if (visao === "semana") {
      const ini = startOfWeek(referencia, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: ini, end: endOfWeek(referencia, { weekStartsOn: 1 }) });
    }
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(referencia), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(referencia), { weekStartsOn: 1 }),
    });
  }, [visao, referencia]);

  const agendados = filtrados.filter((p) => p.scheduled_for);
  const semData = filtrados.filter(
    (p) => !p.scheduled_for && SEM_DATA_STATUS.includes(p.status),
  );

  const proximos7d = useMemo(() => {
    const agora = Date.now();
    const limite = agora + 7 * 86_400_000;
    return agendados.filter((p) => {
      const t = new Date(p.scheduled_for!).getTime();
      return t >= agora && t <= limite;
    });
  }, [agendados]);


  function doDia(dia: Date) {
    return agendados.filter((p) => isSameDay(new Date(p.scheduled_for!), dia));
  }

  async function soltarNoDia(dia: Date, e: React.DragEvent) {
    e.preventDefault();
    setDiaSobre(null);
    const id = e.dataTransfer.getData("text/post-id");
    if (!id) return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const iso = post.scheduled_for ? trocarDia(post.scheduled_for, dia) : meioDiaSP(dia);
    try {
      await agendar.mutateAsync({ id, scheduled_for: iso });
      const anterior = post.scheduled_for;
      toastDesfazer(`Agendado para ${format(dia, "dd/MM", { locale: ptBR })}`, async () => {
        try {
          await agendar.mutateAsync({ id, scheduled_for: anterior });
          toast("Agendamento desfeito");
        } catch {
          toast.error("Não foi possível desfazer");
        }
      });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível agendar");
    }
  }

  const hoje = new Date();

  const faixa = doPainel ? (
    <FaixaDeContexto
      recorte={foco7d ? "próximos 7 dias" : "agenda editorial"}
      onLimpar={limparRecorte}
    />
  ) : null;

  if (carregando && doPainel) {
    return (
      <Revelar className="space-y-4">
        {faixa}
        <div className="secao-entrada">
          <SemanaEsqueleto />
        </div>
      </Revelar>
    );
  }

  return (
    <Revelar className="space-y-4">
      {faixa}

      {foco7d && !carregando && proximos7d.length === 0 && (
        <div className="cartao secao-entrada flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted">Nada agendado pros próximos 7 dias.</p>
          <button
            className="btn px-3 py-1.5 text-xs"
            onClick={() => {
              setVisao("mes");
              limparRecorte();
            }}
          >
            ver o mês inteiro
          </button>
        </div>
      )}

      <div className="secao-entrada flex flex-wrap items-center gap-2">

        <div className="flex gap-2">
          <Chip ativo={visao === "mes"} onClick={() => setVisao("mes")}>
            Mês
          </Chip>
          <Chip ativo={visao === "semana"} onClick={() => setVisao("semana")}>
            Semana
          </Chip>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="btn !p-1.5"
            aria-label="Anterior"
            onClick={() =>
              setReferencia((d) => (visao === "mes" ? addMonths(d, -1) : addWeeks(d, -1)))
            }
          >
            <ChevronLeft size={16} />
          </button>
          <span className="numero min-w-[9rem] text-center text-sm capitalize">
            {visao === "mes"
              ? format(referencia, "MMMM 'de' yyyy", { locale: ptBR })
              : `${format(startOfWeek(referencia, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })} – ${format(endOfWeek(referencia, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })}`}
          </span>
          <button
            className="btn !p-1.5"
            aria-label="Próximo"
            onClick={() =>
              setReferencia((d) => (visao === "mes" ? addMonths(d, 1) : addWeeks(d, 1)))
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="secao-entrada flex gap-2 overflow-x-auto pb-1">
        <Chip ativo={!canal && !pilar && !status} onClick={() => {
          setCanal(null);
          setPilar(null);
          setStatus(null);
        }}>
          Tudo
        </Chip>
        {CANAIS.map((c) => (
          <Chip key={c.valor} ativo={canal === c.valor} onClick={() => setCanal(canal === c.valor ? null : c.valor)}>
            {c.rotulo}
          </Chip>
        ))}
        {pilares.map((p) => (
          <Chip key={p.id} ativo={pilar === p.id} onClick={() => setPilar(pilar === p.id ? null : p.id)}>
            {p.name}
          </Chip>
        ))}
        {COLUNAS.map((c) => (
          <Chip
            key={c.status}
            ativo={status === c.status}
            onClick={() => setStatus(status === c.status ? null : c.status)}
          >
            {c.rotulo}
          </Chip>
        ))}
      </div>

      <div className="secao-entrada grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="cartao overflow-hidden p-3">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].map((d) => (
              <div key={d} className="rotulo text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia) => {
              const lista = doDia(dia);
              const visiveis = lista.slice(0, 3);
              const resto = lista.slice(3);
              const chave = dia.toISOString();
              const foraDoMes = visao === "mes" && !isSameMonth(dia, referencia);

              return (
                <div
                  key={chave}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDiaSobre(chave);
                  }}
                  onDragLeave={() => setDiaSobre((d) => (d === chave ? null : d))}
                  onDrop={(e) => void soltarNoDia(dia, e)}
                  className={
                    "flex flex-col gap-1 rounded-[8px] bg-bg2 p-1.5 " +
                    (visao === "semana" ? "min-h-[220px] " : "min-h-[104px] ") +
                    (foraDoMes ? "opacity-45 " : "") +
                    (isSameDay(dia, hoje) ? "ring-1 ring-azure/40 " : "") +
                    (diaSobre === chave ? "bg-white/6" : "")
                  }
                >
                  <span className="numero text-xs text-muted">{format(dia, "d")}</span>
                  {visiveis.map((p) => (
                    <Pill
                      key={p.id}
                      post={p}
                      onClick={() => void navigate({ to: "/post/$id", params: { id: p.id } })}
                      onDragStart={(e) => e.dataTransfer.setData("text/post-id", p.id)}
                    />
                  ))}
                  {resto.length > 0 && (
                    <Popover>
                      <PopoverTrigger className="rotulo text-left hover:text-corpo">
                        +{resto.length}
                      </PopoverTrigger>
                      <PopoverContent className="w-56 space-y-1 border-line bg-card p-2">
                        {resto.map((p) => (
                          <Pill
                            key={p.id}
                            post={p}
                            onClick={() => void navigate({ to: "/post/$id", params: { id: p.id } })}
                            onDragStart={(e) => e.dataTransfer.setData("text/post-id", p.id)}
                          />
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="cartao h-fit p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="rotulo">Sem data</span>
            <span className="numero text-xs text-muted">{semData.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {carregando && <p className="text-xs text-muted">Carregando…</p>}
            {!carregando && semData.length === 0 && (
              <p className="text-xs text-muted">Tudo agendado por aqui.</p>
            )}
            {semData.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/post-id", p.id)}
                className="cursor-grab rounded-[8px] bg-card2 p-2 active:cursor-grabbing"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: corDoCanal(p.channel) }}
                  />
                  <span className="line-clamp-2 text-xs text-corpo">{p.title}</span>
                </div>
                <span className="rotulo mt-1 block">
                  {p.pillar_id ? (pilarPorId.get(p.pillar_id)?.name ?? ROTULO_STATUS[p.status]) : ROTULO_STATUS[p.status]}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

    </Revelar>
  );
}

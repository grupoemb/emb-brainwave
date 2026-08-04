import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarca, usePilaresCompletos } from "@/hooks/useAjustes";
import { useOrg } from "@/hooks/useOrg";
import type { Pilar } from "@/lib/ajustes.functions";

const PALETA = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#f6bd24", "#00a4ff"];

function Campo({
  rotulo,
  valor,
  onChange,
  editavel,
  linhas = 4,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  editavel: boolean;
  linhas?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-corpo">
      {rotulo}
      <textarea
        value={valor}
        rows={linhas}
        readOnly={!editavel}
        onChange={(e) => onChange(e.target.value)}
        className={
          "resize-y rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt outline-none focus:border-azure " +
          (editavel ? "" : "cursor-default text-muted")
        }
      />
    </label>
  );
}

export function AbaMarca() {
  const { podeEditarMarca } = useOrg();
  const { marca, carregando, gravar } = useMarca();
  const { pilares, carregando: carregandoPilares, gravar: gravarPilar, excluir } =
    usePilaresCompletos();

  const [voice, setVoice] = useState("");
  const [audience, setAudience] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [editando, setEditando] = useState<Partial<Pilar> | null>(null);

  useEffect(() => {
    if (!marca) return;
    setVoice(marca.voice);
    setAudience(marca.audience);
    setGuidelines(marca.guidelines);
  }, [marca]);

  return (
    <div className="space-y-4">
      <div className="cartao secao-entrada max-w-2xl p-6">
        <div className="rotulo">Perfil da marca</div>
        <p className="mt-2 text-xs text-alerta">
          Este texto alimenta TODA geração de conteúdo da IA.
        </p>

        {carregando ? (
          <div className="mt-4 h-64 esqueleto rounded-[.5rem]" />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <Campo rotulo="Voz" valor={voice} onChange={setVoice} editavel={podeEditarMarca} />
            <Campo
              rotulo="Público"
              valor={audience}
              onChange={setAudience}
              editavel={podeEditarMarca}
            />
            <Campo
              rotulo="Diretrizes"
              valor={guidelines}
              onChange={setGuidelines}
              editavel={podeEditarMarca}
              linhas={6}
            />
            {podeEditarMarca ? (
              <button
                onClick={() =>
                  gravar.mutate({
                    id: marca?.id ?? null,
                    name: marca?.name || "Marca",
                    voice,
                    audience,
                    guidelines,
                  })
                }
                disabled={gravar.isPending}
                className="btn-primario mt-1 w-fit px-4 py-2 text-sm"
              >
                {gravar.isPending ? "Salvando…" : "Salvar marca"}
              </button>
            ) : (
              <p className="text-xs text-muted">Somente administradores e editores podem alterar.</p>
            )}
          </div>
        )}
      </div>

      <div className="cartao secao-entrada max-w-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="rotulo">Pilares de conteúdo</div>
          {podeEditarMarca ? (
            <button
              onClick={() => setEditando({ name: "", description: "", color: PALETA[0]! })}
              className="btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <Plus size={13} /> Novo pilar
            </button>
          ) : null}
        </div>

        {carregandoPilares ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 esqueleto rounded-[.5rem]" />
            ))}
          </div>
        ) : pilares.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nenhum pilar ainda. Os pilares organizam o conteúdo por tema.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {pilares.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: p.color ?? "#8294ab" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-txt">{p.name}</p>
                  {p.description ? (
                    <p className="truncate text-xs text-muted">{p.description}</p>
                  ) : null}
                </div>
                {podeEditarMarca ? (
                  <>
                    <button
                      onClick={() => setEditando(p)}
                      title="Editar pilar"
                      className="rounded-[.5rem] p-2 text-muted transition-colors hover:bg-white/6 hover:text-corpo"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => excluir.mutate(p.id)}
                      title="Remover pilar"
                      className="rounded-[.5rem] p-2 text-muted transition-colors hover:bg-white/6 hover:text-ruim"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <DialogPilar
        pilar={editando}
        onFechar={() => setEditando(null)}
        onSalvar={(v) => {
          gravarPilar.mutate(v);
          setEditando(null);
        }}
      />
    </div>
  );
}

function DialogPilar({
  pilar,
  onFechar,
  onSalvar,
}: {
  pilar: Partial<Pilar> | null;
  onFechar: () => void;
  onSalvar: (v: { id: string | null; name: string; description: string; color: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PALETA[0]!);

  useEffect(() => {
    if (!pilar) return;
    setName(pilar.name ?? "");
    setDescription(pilar.description ?? "");
    setColor(pilar.color ?? PALETA[0]!);
  }, [pilar]);

  return (
    <Dialog open={!!pilar} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="border-line bg-card">
        <DialogHeader>
          <DialogTitle>{pilar?.id ? "Editar pilar" : "Novo pilar"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-corpo">
            Nome
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt outline-none focus:border-azure"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-corpo">
            Descrição
            <textarea
              value={description}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-y rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt outline-none focus:border-azure"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm text-corpo">
            Cor
            <div className="flex gap-2">
              {PALETA.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Cor ${c}`}
                  style={{ background: c }}
                  className={
                    "h-7 w-7 rounded-full transition-transform " +
                    (color === c ? "ring-2 ring-azureClaro ring-offset-2 ring-offset-card" : "")
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <button className="btn px-3 py-2 text-sm" onClick={onFechar}>
            Cancelar
          </button>
          <button
            className="btn-primario px-4 py-2 text-sm"
            disabled={!name.trim()}
            onClick={() =>
              onSalvar({ id: pilar?.id ?? null, name: name.trim(), description, color })
            }
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { toast } from "sonner";

import { toastDesfazer } from "@/lib/toastDesfazer";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePilares, useCriarPost, useExcluirPost } from "@/hooks/useConteudo";
import { useOrg } from "@/hooks/useOrg";
import { CANAIS, FORMATOS, type Canal, type Formato } from "@/lib/conteudo";

export function NovoCardDialog({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const { organizationId } = useOrg();
  const { pilares } = usePilares();
  const criar = useCriarPost();
  const excluir = useExcluirPost();

  const [titulo, setTitulo] = useState("");
  const [canal, setCanal] = useState<Canal | "">("");
  const [formato, setFormato] = useState<Formato | "">("");
  const [pilar, setPilar] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId || !titulo.trim()) return;

    try {
      const criado = await criar.mutateAsync({
        organizationId,
        title: titulo.trim(),
        channel: canal || null,
        format: formato || null,
        pillar_id: pilar || null,
      });
      setTitulo("");
      setCanal("");
      setFormato("");
      setPilar("");
      aoFechar();
      toastDesfazer("Card criado", async () => {
        try {
          await excluir.mutateAsync({ id: criado.id });
          toast("Criação desfeita");
        } catch {
          toast.error("Não foi possível desfazer");
        }
      });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível criar o card");
    }
  }

  const campo =
    "w-full rounded-[.55rem] border border-line bg-card2 px-3 py-2 text-sm text-corpo outline-none";

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="border-line bg-card">
        <DialogHeader>
          <DialogTitle>Novo card</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={(e) => void enviar(e)}>
          <div>
            <label className="rotulo mb-1 block" htmlFor="titulo">
              Título
            </label>
            <input
              id="titulo"
              required
              className={campo}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: 3 erros comuns em anúncios"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="rotulo mb-1 block" htmlFor="canal">
                Canal
              </label>
              <select
                id="canal"
                className={campo}
                value={canal}
                onChange={(e) => setCanal(e.target.value as Canal | "")}
              >
                <option value="">—</option>
                {CANAIS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="rotulo mb-1 block" htmlFor="formato">
                Formato
              </label>
              <select
                id="formato"
                className={campo}
                value={formato}
                onChange={(e) => setFormato(e.target.value as Formato | "")}
              >
                <option value="">—</option>
                {FORMATOS.map((f) => (
                  <option key={f.valor} value={f.valor}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="rotulo mb-1 block" htmlFor="pilar">
              Pilar
            </label>
            <select
              id="pilar"
              className={campo}
              value={pilar}
              onChange={(e) => setPilar(e.target.value)}
            >
              <option value="">—</option>
              {pilares.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <button type="button" className="btn" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={criar.isPending}>
              {criar.isPending ? "Criando…" : "Criar card"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

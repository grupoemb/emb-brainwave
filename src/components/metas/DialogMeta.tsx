import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormularioMeta } from "@/hooks/useMetas";
import {
  infoMetrica,
  METRICAS,
  MODOS,
  periodoAtalho,
  type Meta,
  type MetricaMeta,
  type ModoMeta,
} from "@/lib/metas";

const TODAS = "__todas__";

function vazio(): FormularioMeta {
  const p = periodoAtalho("30d");
  return {
    metric: "reach",
    handle: null,
    mode: "accumulate",
    target: 0,
    start_date: p.inicio,
    end_date: p.fim,
    label: null,
  };
}

export function DialogMeta({
  aberto,
  aoFechar,
  metaEmEdicao,
  inicial,
  perfis,
  aoSalvar,
  salvando,
}: {
  aberto: boolean;
  aoFechar: () => void;
  metaEmEdicao: Meta | null;
  inicial?: Partial<FormularioMeta> | null;
  perfis: string[];
  aoSalvar: (f: FormularioMeta) => void;
  salvando: boolean;
}) {
  const [form, setForm] = useState<FormularioMeta>(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (metaEmEdicao) {
      setForm({
        id: metaEmEdicao.id,
        metric: metaEmEdicao.metric,
        handle: metaEmEdicao.handle,
        mode: metaEmEdicao.mode,
        target: metaEmEdicao.target,
        start_date: metaEmEdicao.start_date,
        end_date: metaEmEdicao.end_date,
        label: metaEmEdicao.label,
      });
    } else {
      setForm({ ...vazio(), ...(inicial ?? {}) });
    }
  }, [aberto, metaEmEdicao, inicial]);

  const seguidores = form.metric === "followers";

  function mudarMetrica(m: MetricaMeta) {
    setForm((f) => ({
      ...f,
      metric: m,
      mode: m === "followers" ? (f.mode === "accumulate" ? "increase" : f.mode) : "accumulate",
    }));
  }

  const valido = form.target > 0 && form.start_date < form.end_date;

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{metaEmEdicao ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>
            Escolha o que medir, para quem e até quando. O ritmo é calculado sozinho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Métrica</Label>
              <Select value={form.metric} onValueChange={(v) => mudarMetrica(v as MetricaMeta)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICAS.map((m) => (
                    <SelectItem key={m.valor} value={m.valor}>
                      {m.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select
                value={form.handle ?? TODAS}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, handle: v === TODAS ? null : v.toLowerCase() }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODAS}>Todas as contas</SelectItem>
                  {perfis.map((h) => (
                    <SelectItem key={h} value={h}>
                      @{h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {seguidores ? (
            <div className="space-y-1.5">
              <Label>Tipo de meta</Label>
              <div className="flex flex-wrap gap-2">
                {MODOS.filter((m) => m.valor !== "accumulate").map((m) => (
                  <button
                    key={m.valor}
                    type="button"
                    title={m.ajuda}
                    aria-pressed={form.mode === m.valor}
                    onClick={() => setForm((f) => ({ ...f, mode: m.valor as ModoMeta }))}
                    className={
                      "rounded-[.5rem] border px-3 py-1.5 text-xs transition-colors " +
                      (form.mode === m.valor
                        ? "border-azure/50 bg-azure/14 font-semibold text-txt"
                        : "border-line text-muted hover:text-corpo")
                    }
                  >
                    {m.rotulo}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="meta-alvo">Alvo</Label>
            <Input
              id="meta-alvo"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={infoMetrica(form.metric).exemploAlvo}
              value={form.target || ""}
              onChange={(e) => setForm((f) => ({ ...f, target: Number(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Período</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="date"
                aria-label="Início"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
              <Input
                type="date"
                aria-label="Fim"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  ["mes", "Este mês"],
                  ["30d", "Próximos 30 dias"],
                  ["trimestre", "Trimestre"],
                ] as const
              ).map(([tipo, rotulo]) => (
                <button
                  key={tipo}
                  type="button"
                  className="btn px-2.5 py-1 text-xs"
                  onClick={() => {
                    const p = periodoAtalho(tipo);
                    setForm((f) => ({ ...f, start_date: p.inicio, end_date: p.fim }));
                  }}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meta-rotulo">Rótulo (opcional)</Label>
            <Input
              id="meta-rotulo"
              placeholder="Ex.: Sprint de agosto"
              value={form.label ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value || null }))}
            />
          </div>
        </div>

        <DialogFooter>
          <button type="button" className="btn px-3 py-1.5 text-sm" onClick={aoFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primario px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={!valido || salvando}
            onClick={() => aoSalvar(form)}
          >
            {salvando ? "Salvando…" : metaEmEdicao ? "Salvar alterações" : "Criar meta"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { useTemplates } from "@/hooks/useAjustes";
import { useOrg } from "@/hooks/useOrg";
import type { Template } from "@/lib/ajustes.functions";

export function AbaTemplates() {
  const { podeEditarMarca } = useOrg();
  const { templates, carregando, gravar } = useTemplates();
  const [aberto, setAberto] = useState<Template | null>(null);
  const [prompt, setPrompt] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!aberto) return;
    setPrompt(aberto.system_prompt ?? "");
    setAtivo(aberto.is_active);
  }, [aberto]);

  if (!podeEditarMarca) {
    return (
      <div className="cartao secao-entrada max-w-2xl p-8 text-sm text-muted">
        Só administradores e editores podem ver e ajustar os templates de IA.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="secao-entrada max-w-2xl text-xs text-alerta">
        Estes templates definem como a IA escreve cada tipo de peça no Studio Criar.
      </p>

      <div className="cartao secao-entrada max-w-2xl p-2">
        {carregando ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-[.5rem] bg-white/5" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <p className="p-6 text-sm text-muted">Nenhum template cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {templates.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setAberto(aberto?.id === t.id ? null : t)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[.03]"
                >
                  <span className="rotulo shrink-0">{t.kind}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-txt">{t.title}</span>
                  <span className="text-xs text-muted">v{t.version}</span>
                  <span className={t.is_active ? "pill pill-bom" : "pill pill-ruim"}>
                    {t.is_active ? "ativo" : "inativo"}
                  </span>
                </button>

                {aberto?.id === t.id ? (
                  <div className="border-t border-line px-3 py-3">
                    <textarea
                      value={prompt}
                      rows={16}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full resize-y rounded-[.5rem] border border-line bg-bg2 px-3 py-2 font-mono text-xs leading-relaxed text-txt outline-none focus:border-azure"
                    />
                    <div className="mt-3 flex items-center gap-3">
                      <Switch checked={ativo} onCheckedChange={setAtivo} aria-label="Template ativo" />
                      <span className="text-xs text-muted">
                        {ativo ? "ativo no Studio Criar" : "desativado"}
                      </span>
                      <button
                        onClick={() =>
                          gravar.mutate({
                            id: t.id,
                            system_prompt: prompt,
                            is_active: ativo,
                            version: t.version,
                          })
                        }
                        disabled={gravar.isPending || !prompt.trim()}
                        className="btn-primario ml-auto px-4 py-2 text-sm"
                      >
                        {gravar.isPending ? "Salvando…" : `Salvar como v${t.version + 1}`}
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

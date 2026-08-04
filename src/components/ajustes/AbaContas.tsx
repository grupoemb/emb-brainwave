import { Instagram, Linkedin, Music2, Youtube, type LucideIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { useContasSociais } from "@/hooks/useAjustes";
import { useOrg } from "@/hooks/useOrg";

const ICONE: Record<string, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Music2,
  youtube: Youtube,
};

function dataCurta(iso: string | null) {
  if (!iso) return "sem coleta ainda";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AbaContas() {
  const { isAdmin } = useOrg();
  const { contas, carregando, alternarAtiva } = useContasSociais();

  return (
    <div className="space-y-3">
      <div className="cartao secao-entrada max-w-2xl p-2">
        {carregando ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-[.5rem] bg-white/5" />
            ))}
          </div>
        ) : contas.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Nenhuma conta cadastrada. O administrador conecta as contas pelo backend.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {contas.map((c) => {
              const Icone = ICONE[c.channel] ?? Instagram;
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                  <Icone size={16} className="shrink-0 text-azureClaro" />
                  <span className="text-sm text-txt">@{c.handle.replace(/^@/, "")}</span>
                  <span className={c.connected_at ? "pill pill-bom" : "pill pill-alerta"}>
                    {c.connected_at ? "Conectada" : "Aguardando token"}
                  </span>
                  <span className="ml-auto text-xs text-muted">
                    última coleta: {dataCurta(c.ultimaColeta)}
                  </span>
                  {isAdmin ? (
                    <Switch
                      checked={c.is_active}
                      disabled={alternarAtiva.isPending}
                      onCheckedChange={(v) => alternarAtiva.mutate({ id: c.id, ativa: v })}
                      aria-label="Conta ativa"
                    />
                  ) : (
                    <span className="text-xs text-muted">{c.is_active ? "ativa" : "inativa"}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="secao-entrada max-w-2xl text-xs text-muted">
        Tokens e coleta são gerenciados pelo backend; novas contas são conectadas pelo
        administrador.
      </p>
    </div>
  );
}

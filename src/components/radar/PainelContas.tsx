import { useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { BarrasContas } from "@/components/radar/BarrasContas";
import { CartaoConta } from "@/components/radar/CartaoConta";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useContas } from "@/hooks/useContas";
import { haQuantoTempo } from "@/lib/contas";

export function PainelContas() {
  const navigate = useNavigate();
  const { data, isPending, error } = useContas();

  const contas = data?.contas ?? [];
  const frescor = haQuantoTempo(data?.ultimaColeta ?? null);

  function abrir(handle: string) {
    void navigate({ to: "/radar", search: { aba: "radar", handle } });
  }

  return (
    <div className="space-y-4">
      <CabecalhoTela
        icone={<Users size={17} />}
        titulo="Suas contas"
        descricao={
          frescor
            ? `Leitura das contas próprias · coletado há ${frescor}.`
            : "Leitura das contas próprias monitoradas pelo radar."
        }
      />

      {isPending ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="cartao h-[190px] animate-pulse p-5" />
          ))}
        </div>
      ) : error ? (
        <EstadoVazio
          variante="erro"
          titulo="Não foi possível ler as contas"
          descricao={error instanceof Error ? error.message : "Tente de novo em instantes."}
        />
      ) : contas.length === 0 ? (
        <EstadoVazio
          titulo="Aguardando a primeira coleta das contas."
          descricao="Assim que os reels das contas conectadas forem lidos, o painel aparece aqui."
        />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            <BarrasContas
              id="gradContasViews"
              titulo="Média de views por conta"
              cor="#00a4ff"
              dados={contas.map((c) => ({ rotulo: `@${c.handle}`, valor: c.avgViews ?? 0 }))}
            />
            <BarrasContas
              id="gradContasEng"
              titulo="Engajamento % por conta"
              cor="#3ecf8e"
              casas={1}
              sufixo="%"
              dados={contas.map((c) => ({ rotulo: `@${c.handle}`, valor: c.engPct ?? 0 }))}
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {contas.map((c) => (
              <CartaoConta key={c.handle} conta={c} aoAbrir={() => abrir(c.handle)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

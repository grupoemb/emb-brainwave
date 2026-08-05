import { useState } from "react";
import { Users } from "lucide-react";

import { BarrasContas } from "@/components/radar/BarrasContas";
import { CartaoConta } from "@/components/radar/CartaoConta";
import { DrawerConta } from "@/components/radar/DrawerConta";
import { TopReelsContas } from "@/components/radar/TopReelsContas";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useContas } from "@/hooks/useContas";
import { haQuantoTempo } from "@/lib/contas";

export function PainelContas() {
  const { data, isPending, error } = useContas();
  const [aberta, setAberta] = useState<string | null>(null);

  const contas = data?.contas ?? [];
  const topReels = data?.topReels ?? [];
  const frescor = haQuantoTempo(data?.ultimaColeta ?? null);

  return (
    <div className="space-y-4">
      <CabecalhoTela
        icone={<Users size={17} />}
        titulo="Suas contas"
        descricao={
          frescor
            ? `Leitura automática das contas próprias · coletado há ${frescor}.`
            : "Leitura automática das contas próprias monitoradas pelo radar."
        }
      />

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contas.map((c) => (
              <CartaoConta key={c.handle} conta={c} aoAbrir={() => setAberta(c.handle)} />
            ))}
          </div>

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

          <TopReelsContas reels={topReels} />
        </>
      )}

      <DrawerConta handle={aberta} aoFechar={() => setAberta(null)} />
    </div>
  );
}

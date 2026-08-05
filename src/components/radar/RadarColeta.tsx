import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useState } from "react";
import { Info, Plus } from "lucide-react";

import { DialogoItemManual } from "@/components/radar/DialogoItemManual";

export function RadarColeta() {
  const [perfil, setPerfil] = useState("");
  const [dialogo, setDialogo] = useState(false);

  return (
    <div className="space-y-4">
      <div className="cartao space-y-3 p-4">
        <label className="block">
          <span className="rotulo mb-1.5 block">Colar link do perfil</span>
          <div className="flex flex-wrap gap-2">
            <input
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              placeholder="https://instagram.com/perfil"
              className="min-w-[14rem] flex-1 rounded-[.55rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none focus:ring-2 focus:ring-azure/40"
            />
            <button type="button" className="btn-primario px-4 py-2 text-xs" disabled={!perfil.trim()}>
              Analisar
            </button>
          </div>
        </label>

        <div className="flex items-start gap-2 rounded-[.6rem] border border-line bg-white/4 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-azureClaro" />
          <p className="text-xs text-corpo">
            A coleta de um perfil é feita de forma assistida (peça no chat) ou colando os reels
            manualmente abaixo.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={() => setDialogo(true)}
          >
            <Plus size={13} />
            Adicionar item manual
          </button>
        </div>
      </div>

      <div className="cartao overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="rotulo">Reels encontrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="rotulo px-4 py-2 font-normal">Reel</th>
                <th className="rotulo px-4 py-2 text-right font-normal">views</th>
                <th className="rotulo px-4 py-2 text-right font-normal">vx</th>
                <th className="rotulo px-4 py-2 font-normal">gancho</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-4">
                  <EstadoVazio
                    titulo="Nenhum reel coletado ainda"
                    descricao="A coleta automática entra em breve."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <DialogoItemManual aberto={dialogo} aoFechar={() => setDialogo(false)} />
    </div>
  );
}

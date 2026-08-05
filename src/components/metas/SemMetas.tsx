import { Target } from "lucide-react";

import { EstadoVazio } from "@/components/ui/EstadoVazio";
import type { FormularioMeta } from "@/hooks/useMetas";
import { periodoAtalho } from "@/lib/metas";

export function SemMetas({
  perfilExemplo,
  aoCriar,
}: {
  perfilExemplo: string | null;
  aoCriar: (inicial?: Partial<FormularioMeta>) => void;
}) {
  const trinta = periodoAtalho("30d");
  const mes = periodoAtalho("mes");

  const exemplos: { rotulo: string; inicial: Partial<FormularioMeta> }[] = [
    {
      rotulo: perfilExemplo
        ? `+5.000 seguidores em 30 dias (@${perfilExemplo})`
        : "+5.000 seguidores em 30 dias",
      inicial: {
        metric: "followers",
        mode: "increase",
        target: 5000,
        handle: perfilExemplo,
        start_date: trinta.inicio,
        end_date: trinta.fim,
      },
    },
    {
      rotulo: "1.000.000 de alcance neste mês (todas as contas)",
      inicial: {
        metric: "reach",
        mode: "accumulate",
        target: 1_000_000,
        handle: null,
        start_date: mes.inicio,
        end_date: mes.fim,
      },
    },
  ];

  return (
    <EstadoVazio
      icone={<Target size={20} />}
      titulo="Nenhuma meta por aqui ainda"
      descricao="Defina um alvo e um prazo — o painel calcula o ritmo, a projeção e quanto falta por dia."
      acao={
        <div className="flex flex-col items-center gap-3">
          <button type="button" className="btn-primario px-3 py-1.5 text-sm" onClick={() => aoCriar()}>
            Criar primeira meta
          </button>
          <div className="flex flex-wrap justify-center gap-2">
            {exemplos.map((e) => (
              <button
                key={e.rotulo}
                type="button"
                className="btn px-2.5 py-1 text-xs"
                onClick={() => aoCriar(e.inicial)}
              >
                {e.rotulo}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}

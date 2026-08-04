import { Sparkles } from "lucide-react";

import { useAudienciaOrg } from "@/hooks/useInteligencia";

function Lista({ titulo, itens }: { titulo: string; itens: { texto: string; contagem: number }[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <span className="rotulo">{titulo}</span>
      <ul className="space-y-1">
        {itens.map((i) => (
          <li key={i.texto} className="flex items-start justify-between gap-3">
            <span className="text-sm text-corpo">{i.texto}</span>
            <span className="numero shrink-0 text-xs text-muted">{i.contagem}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AudienciaPede() {
  const { carregando, perguntas, temas } = useAudienciaOrg();
  const vazio = perguntas.length === 0 && temas.length === 0;

  return (
    <div className="cartao space-y-3 border-l-2 border-l-azure p-5">
      <h2 className="flex items-center gap-1.5 text-sm font-bold text-txt">
        <Sparkles size={12} className="text-azureClaro" />
        O que a audiência pede
      </h2>

      {carregando ? (
        <div className="space-y-2">
          <div className="h-3 w-11/12 rounded bg-white/6" />
          <div className="h-3 w-3/4 rounded bg-white/6" />
          <div className="h-3 w-2/3 rounded bg-white/6" />
        </div>
      ) : vazio ? (
        <p className="text-sm text-muted">
          Aguardando leitura de comentários — permissão pendente nos tokens das contas.
        </p>
      ) : (
        <div className="space-y-4">
          <Lista titulo="Perguntas recorrentes" itens={perguntas} />
          <Lista titulo="Temas recorrentes" itens={temas} />
        </div>
      )}
    </div>
  );
}

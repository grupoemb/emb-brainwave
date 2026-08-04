import { Sparkles } from "lucide-react";

import { LinhaEsqueleto } from "@/components/conteudo/Esqueleto";
import { useAudienciaPost } from "@/hooks/useInteligencia";

const PILL_SENTIMENTO: Record<string, { classe: string; rotulo: string }> = {
  positivo: { classe: "pill pill-bom", rotulo: "Positivo" },
  positive: { classe: "pill pill-bom", rotulo: "Positivo" },
  negativo: { classe: "pill pill-ruim", rotulo: "Negativo" },
  negative: { classe: "pill pill-ruim", rotulo: "Negativo" },
  misto: { classe: "pill pill-alerta", rotulo: "Misto" },
  mixed: { classe: "pill pill-alerta", rotulo: "Misto" },
  neutro: { classe: "pill bg-white/6 text-muted", rotulo: "Neutro" },
  neutral: { classe: "pill bg-white/6 text-muted", rotulo: "Neutro" },
};

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <span className="rotulo">{titulo}</span>
      <ul className="space-y-1">
        {itens.map((t) => (
          <li key={t} className="text-sm text-corpo">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AbaAudiencia({ postId }: { postId: string }) {
  const { carregando, nota } = useAudienciaPost(postId);

  if (carregando) {
    return (
      <div className="space-y-2">
        <LinhaEsqueleto />
        <LinhaEsqueleto />
        <LinhaEsqueleto />
      </div>
    );
  }

  if (!nota || nota.sentiment === "sem_volume") {
    return (
      <p className="text-sm text-muted">Sem leitura de audiência para este post ainda.</p>
    );
  }

  const pill = nota.sentiment ? PILL_SENTIMENTO[nota.sentiment.toLowerCase()] : undefined;

  return (
    <div className="space-y-3 border-l-2 border-l-azure pl-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Sparkles size={12} className="text-azureClaro" />
          leitura de comentários
        </span>
        {pill ? <span className={pill.classe}>{pill.rotulo}</span> : null}
      </div>

      {nota.summary ? <p className="text-sm text-corpo">{nota.summary}</p> : null}

      {typeof nota.comment_count === "number" ? (
        <p className="text-xs text-muted">
          <span className="numero">{nota.comment_count}</span> comentários analisados
        </p>
      ) : null}

      <Lista titulo="Temas" itens={nota.temas} />
      <Lista titulo="Perguntas" itens={nota.perguntas} />
    </div>
  );
}

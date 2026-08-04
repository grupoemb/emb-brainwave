import { useEffect, useState } from "react";
import { toast } from "sonner";

const DURACAO = 7000;

function Contagem({ ate }: { ate: number }) {
  const [restante, setRestante] = useState(() =>
    Math.max(0, Math.ceil((ate - Date.now()) / 1000)),
  );

  useEffect(() => {
    const t = setInterval(() => {
      setRestante(Math.max(0, Math.ceil((ate - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(t);
  }, [ate]);

  return (
    <span className="flex items-center gap-1.5">
      Desfazer
      <span className="numero text-[.7rem] tabular-nums opacity-70">{restante}s</span>
    </span>
  );
}

/** Toast de sucesso com botão "Desfazer" e contagem regressiva. */
export function toastDesfazer(mensagem: string, aoDesfazer: () => void | Promise<void>) {
  const ate = Date.now() + DURACAO;

  toast.success(mensagem, {
    duration: DURACAO,
    action: {
      label: (<Contagem ate={ate} />) as unknown as string,
      onClick: () => {
        void aoDesfazer();
      },
    },
  });
}

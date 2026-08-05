import { MarcaB7 } from "@/components/ui/MarcaB7";

/**
 * Carregamento de tela/rota inteira com assinatura da marca.
 * O brilho é desligado por prefers-reduced-motion (regra em styles.css).
 */
export function CarregandoTela({
  rotulo = "Carregando…",
  compacto = false,
}: {
  rotulo?: string;
  compacto?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "flex flex-col items-center justify-center gap-3 text-center " +
        (compacto ? "py-8" : "py-20")
      }
    >
      <MarcaB7 altura={compacto ? 20 : 28} />
      <div className="h-[3px] w-28 overflow-hidden rounded-full esqueleto" />
      <p className="rotulo">{rotulo}</p>
    </div>
  );
}

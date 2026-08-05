import { LogoB7 } from "@/components/ui/LogoB7";

/**
 * Marca-d'água discreta da B7 usada como assinatura visual de estados
 * vazios, de erro e de carregamento. Sem animação em loop.
 */
export function MarcaB7({
  altura = 26,
  tom = "azure",
  className = "",
}: {
  altura?: number;
  tom?: "azure" | "ruim" | "dourado";
  className?: string;
}) {
  const halo =
    tom === "ruim"
      ? "bg-ruim/10"
      : tom === "dourado"
        ? "bg-dourado/10"
        : "bg-azure/10";

  return (
    <div
      aria-hidden
      className={"relative grid place-items-center " + className}
    >
      <span
        className={
          "pointer-events-none absolute h-16 w-32 rounded-full blur-2xl " + halo
        }
      />
      <LogoB7 altura={altura} className="relative opacity-25" />
    </div>
  );
}

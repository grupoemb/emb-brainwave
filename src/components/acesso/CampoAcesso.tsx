import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

export function CampoAcesso({
  rotulo,
  icone: Icone,
  tipo = "text",
  valor,
  onChange,
  dica,
  obrigatorio,
  minLength,
  autoComplete,
  placeholder,
}: {
  rotulo: string;
  icone: LucideIcon;
  tipo?: "text" | "email" | "password";
  valor: string;
  onChange: (v: string) => void;
  dica?: string;
  obrigatorio?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = useId();
  const [vendo, setVendo] = useState(false);
  const senha = tipo === "password";
  const tipoReal = senha ? (vendo ? "text" : "password") : tipo;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      <div className="group relative">
        <Icone
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-azureClaro"
        />
        <input
          id={id}
          type={tipoReal}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          required={obrigatorio}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={
            "h-11 w-full rounded-[.6rem] border border-line bg-bg2/80 pl-9 text-sm text-txt outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-lineForte focus:border-azure focus:bg-bg2 focus:shadow-[0_0_0_3px_rgba(0,164,255,.16)] " +
            (senha ? "pr-10" : "pr-3")
          }
        />
        {senha && (
          <button
            type="button"
            onClick={() => setVendo((v) => !v)}
            aria-label={vendo ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-corpo"
          >
            {vendo ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {dica && <span className="text-[.68rem] text-muted">{dica}</span>}
    </div>
  );
}

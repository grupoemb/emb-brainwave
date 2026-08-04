import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Ícone de ajuda com a explicação do indicador.
 * Precisa estar dentro de um <TooltipProvider>.
 */
export function Dica({ texto, className }: { texto: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={0}
          title={texto}
          aria-label={texto}
          onClick={(e) => e.preventDefault()}
          className={
            "inline-flex shrink-0 cursor-help items-center text-muted transition-colors hover:text-corpo focus-visible:text-corpo " +
            (className ?? "")
          }
        >
          <HelpCircle size={12} />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[17rem] border border-line bg-card text-xs leading-relaxed text-corpo">
        {texto}
      </TooltipContent>
    </Tooltip>
  );
}

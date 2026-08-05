import { Film, Image as ImageIcon, Images, PlaySquare, Flame } from "lucide-react";
import type { Formato } from "@/lib/conteudo";

export function IconeFormato({ formato }: { formato: Formato | null }) {
  const props = { size: 13, className: "shrink-0 text-muted" } as const;
  if (formato === "reel" || formato === "short") return <Film {...props} />;
  if (formato === "carousel") return <Images {...props} />;
  if (formato === "image") return <ImageIcon {...props} />;
  return <PlaySquare {...props} />;
}

export function SeloOutlier({ rx }: { rx: number }) {
  return (
    <span className="inline-flex shrink-0" title={`Fora da curva: ${rx.toFixed(1)}× a mediana`}>
      <Flame size={12} color="#f6bd24" aria-label="fora da curva" />
    </span>
  );
}

export function BarraProporcao({ pct }: { pct: number }) {
  return (
    <span className="hidden h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-white/6 sm:block">
      <span
        className="block h-full rounded-full bg-gradient-to-r from-royal to-azure"
        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
      />
    </span>
  );
}

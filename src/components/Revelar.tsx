import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/**
 * Entrada única de seções: fade + subida de 14px, 0.42s, stagger 45ms.
 * Sem loops, sem parallax. Respeita prefers-reduced-motion.
 */
export function Revelar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const alvos = el.querySelectorAll<HTMLElement>(".secao-entrada");
    if (!alvos.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(alvos, { opacity: 1, y: 0 });
      return;
    }

    const tw = gsap.fromTo(
      alvos,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: "cubic-bezier(.23,1,.32,1)",
        stagger: 0.045,
        overwrite: true,
      },
    );
    return () => {
      tw.kill();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

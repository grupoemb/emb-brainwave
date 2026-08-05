import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/** cubic-bezier(.23,1,.32,1) como função de easing para o gsap */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = 3 * ax * t * t + 2 * bx * t + cx;
      if (Math.abs(d) < 1e-6) break;
      t -= (sampleX(t) - x) / d;
    }
    return sampleY(Math.min(Math.max(t, 0), 1));
  };
}

const suave = bezier(0.23, 1, 0.32, 1);


/**
 * Entrada única de seções: fade + subida de 14px, 0.42s, stagger 45ms.
 * Sem loops, sem parallax. Respeita prefers-reduced-motion.
 */
export function Revelar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const revelados = new WeakSet<HTMLElement>();
    const tweens: gsap.core.Tween[] = [];
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revelar = (alvos: HTMLElement[]) => {
      const novos = alvos.filter((alvo) => !revelados.has(alvo));
      if (!novos.length) return;
      novos.forEach((alvo) => revelados.add(alvo));

      if (reduzirMovimento) {
        gsap.set(novos, { opacity: 1, y: 0 });
        return;
      }

      tweens.push(
        gsap.fromTo(
          novos,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            ease: suave,
            stagger: 0.045,
            overwrite: true,
          },
        ),
      );
    };

    revelar(Array.from(el.querySelectorAll<HTMLElement>(".secao-entrada")));

    const observador = new MutationObserver((mutacoes) => {
      const adicionados: HTMLElement[] = [];
      for (const mutacao of mutacoes) {
        for (const no of mutacao.addedNodes) {
          if (!(no instanceof HTMLElement)) continue;
          if (no.matches(".secao-entrada")) adicionados.push(no);
          adicionados.push(...no.querySelectorAll<HTMLElement>(".secao-entrada"));
        }
      }
      revelar(adicionados);
    });
    observador.observe(el, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

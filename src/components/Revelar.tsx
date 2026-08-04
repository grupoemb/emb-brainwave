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

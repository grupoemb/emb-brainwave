import type { ItemAudiencia } from "@/lib/inteligencia.functions";

/** Normaliza uma lista jsonb que pode conter strings ou objetos. */
export function textosDaLista(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  const saida: string[] = [];
  for (const item of valor) {
    if (typeof item === "string" && item.trim()) saida.push(item.trim());
    else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const t = o["text"] ?? o["texto"] ?? o["question"] ?? o["theme"] ?? o["label"] ?? o["name"];
      if (typeof t === "string" && t.trim()) saida.push(t.trim());
    }
  }
  return saida;
}

export function contar(textos: string[]): ItemAudiencia[] {
  const mapa = new Map<string, { texto: string; contagem: number }>();
  for (const t of textos) {
    const chave = t
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const atual = mapa.get(chave);
    if (atual) atual.contagem += 1;
    else mapa.set(chave, { texto: t, contagem: 1 });
  }
  return [...mapa.values()].sort((a, b) => b.contagem - a.contagem);
}


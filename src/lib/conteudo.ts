export type Status =
  | "idea"
  | "script"
  | "design"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";

export type Canal = "instagram" | "linkedin" | "tiktok" | "youtube";

export type Formato =
  | "reel"
  | "carousel"
  | "image"
  | "story"
  | "video_long"
  | "short"
  | "text"
  | "article"
  | "other";

export type Post = {
  id: string;
  title: string;
  status: Status;
  channel: Canal | null;
  format: Formato | null;
  pillar_id: string | null;
  author_id: string | null;
  suggestion_id: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  autor_nome: string | null;
};

export type Pilar = { id: string; name: string; color: string | null };

export const COLUNAS: { status: Status; rotulo: string; cor: string }[] = [
  { status: "idea", rotulo: "Ideia", cor: "#00e7ff" },
  { status: "script", rotulo: "Roteiro", cor: "#2b9bff" },
  { status: "design", rotulo: "Arte", cor: "#6c7bff" },
  { status: "review", rotulo: "Revisão", cor: "#b06cff" },
  { status: "approved", rotulo: "Aprovado", cor: "#e055c8" },
  { status: "scheduled", rotulo: "Agendado", cor: "#00a4ff" },
  { status: "published", rotulo: "Publicado", cor: "#3ecf8e" },
];

export const ROTULO_STATUS: Record<Status, string> = {
  idea: "Ideia",
  script: "Roteiro",
  design: "Arte",
  review: "Revisão",
  approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
};

export const CANAIS: { valor: Canal; rotulo: string; cor: string }[] = [
  { valor: "instagram", rotulo: "Instagram", cor: "#e055c8" },
  { valor: "linkedin", rotulo: "LinkedIn", cor: "#2b9bff" },
  { valor: "tiktok", rotulo: "TikTok", cor: "#00e7ff" },
  { valor: "youtube", rotulo: "YouTube", cor: "#ff7a6b" },
];

export const FORMATOS: { valor: Formato; rotulo: string }[] = [
  { valor: "reel", rotulo: "Reel" },
  { valor: "carousel", rotulo: "Carrossel" },
  { valor: "image", rotulo: "Imagem" },
  { valor: "story", rotulo: "Story" },
  { valor: "video_long", rotulo: "Vídeo longo" },
  { valor: "short", rotulo: "Short" },
  { valor: "text", rotulo: "Texto" },
  { valor: "article", rotulo: "Artigo" },
  { valor: "other", rotulo: "Outro" },
];

export function corDoCanal(canal: Canal | null) {
  return CANAIS.find((c) => c.valor === canal)?.cor ?? "#8294ab";
}

export function iniciais(texto: string) {
  const partes = texto.trim().split(/[\s@._-]+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return (letras || texto.slice(0, 2) || "?").toUpperCase();
}

/** Cor com opacidade a partir de hex (#rrggbb). */
export function comAlfa(hex: string, alfa: number) {
  const limpo = hex.replace("#", "");
  const n = parseInt(limpo.length === 3 ? limpo.replace(/./g, "$&$&") : limpo, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

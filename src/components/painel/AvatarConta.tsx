import { comAlfa } from "@/lib/conteudo";

/** Avatar da conta: foto quando existir, senão iniciais com gradiente derivado do handle. */
export function AvatarConta({
  conta,
  url,
  tamanho = 44,
}: {
  conta: string;
  url?: string | null;
  tamanho?: number;
}) {
  const iniciais = conta
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  let soma = 0;
  for (const c of conta) soma = (soma * 31 + c.charCodeAt(0)) % 360;
  const a = `hsl(${soma} 85% 55%)`;
  const b = `hsl(${(soma + 48) % 360} 85% 42%)`;

  if (url) {
    return (
      <img
        src={url}
        alt={`Foto de @${conta}`}
        width={tamanho}
        height={tamanho}
        loading="lazy"
        className="shrink-0 rounded-full border border-line object-cover"
        style={{ width: tamanho, height: tamanho }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="numero grid shrink-0 place-items-center rounded-full border border-line font-bold text-white"
      style={{
        width: tamanho,
        height: tamanho,
        fontSize: tamanho * 0.34,
        backgroundImage: `linear-gradient(135deg, ${a}, ${b})`,
        boxShadow: `0 6px 18px -8px ${comAlfa("#000000", 0.8)}`,
      }}
    >
      {iniciais || "?"}
    </span>
  );
}

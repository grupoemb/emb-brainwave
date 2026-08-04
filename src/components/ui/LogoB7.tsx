import logoAsset from "@/assets/logo-b7.png.asset.json";

type Props = {
  /** Altura do logotipo em px. */
  altura?: number;
  className?: string;
};

/** Logotipo oficial B7 (wordmark branco com o arco dourado). */
export function LogoB7({ altura = 20, className }: Props) {
  return (
    <img
      src={logoAsset.url}
      alt="B7"
      height={altura}
      style={{ height: altura }}
      className={"w-auto select-none " + (className ?? "")}
      draggable={false}
    />
  );
}

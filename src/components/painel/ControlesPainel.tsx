import { AvatarConta } from "@/components/painel/AvatarConta";
import type { DiasPainel } from "@/hooks/usePainel";
import { FOCOS, type Foco } from "@/lib/painel.leitura";
import type { PerfilPainel } from "@/lib/painel.tipos";

const JANELAS: DiasPainel[] = [7, 14, 30, 90];

function Segmento({
  ativo,
  children,
  onClick,
  title,
}: {
  ativo: boolean;
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={title}
      className={
        "inline-flex items-center gap-1.5 rounded-[.45rem] px-2.5 py-1 text-xs transition-colors " +
        (ativo
          ? "bg-azure/16 font-semibold text-txt"
          : "text-muted hover:bg-white/6 hover:text-corpo")
      }
    >
      {children}
    </button>
  );
}

function Caixa({ children, rotulo }: { children: React.ReactNode; rotulo: string }) {
  return (
    <div className="flex items-center gap-1 rounded-[.6rem] border border-line bg-bg2/70 p-1">
      <span className="rotulo px-1.5 text-[.56rem]">{rotulo}</span>
      {children}
    </div>
  );
}

export function ControlesPainel({
  dias,
  aoMudarDias,
  perfis,
  perfil,
  aoMudarPerfil,
  foco,
  aoMudarFoco,
}: {
  dias: DiasPainel;
  aoMudarDias: (d: DiasPainel) => void;
  perfis: PerfilPainel[];
  perfil: string | null;
  aoMudarPerfil: (h: string | null) => void;
  foco: Foco;
  aoMudarFoco: (f: Foco) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Caixa rotulo="período">
        {JANELAS.map((d) => (
          <Segmento key={d} ativo={d === dias} onClick={() => aoMudarDias(d)}>
            <span className="numero">{d}d</span>
          </Segmento>
        ))}
      </Caixa>

      {perfis.length > 0 ? (
        <Caixa rotulo="perfil">
          <Segmento ativo={perfil === null} onClick={() => aoMudarPerfil(null)}>
            Todos
          </Segmento>
          {perfis.map((p) => (
            <Segmento
              key={p.handle}
              ativo={perfil === p.handle}
              onClick={() => aoMudarPerfil(p.handle)}
              title={`@${p.handle}`}
            >
              <AvatarConta conta={p.handle} url={p.avatarUrl} tamanho={16} />
              <span className="max-w-[9rem] truncate">@{p.handle}</span>
            </Segmento>
          ))}
        </Caixa>
      ) : null}

      <Caixa rotulo="lente">
        {FOCOS.map((f) => (
          <Segmento key={f.valor} ativo={f.valor === foco} onClick={() => aoMudarFoco(f.valor)}>
            {f.rotulo}
          </Segmento>
        ))}
      </Caixa>
    </div>
  );
}

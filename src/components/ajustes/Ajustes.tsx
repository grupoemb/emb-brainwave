import { useNavigate, useSearch } from "@tanstack/react-router";

import { Revelar } from "@/components/Revelar";
import { AbaContas } from "@/components/ajustes/AbaContas";
import { AbaEquipe } from "@/components/ajustes/AbaEquipe";
import { AbaMarca } from "@/components/ajustes/AbaMarca";
import { AbaPerfil } from "@/components/ajustes/AbaPerfil";
import { AbaTemplates } from "@/components/ajustes/AbaTemplates";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";

const ABAS = [
  { id: "perfil", rotulo: "Perfil" },
  { id: "equipe", rotulo: "Equipe" },
  { id: "contas", rotulo: "Contas" },
  { id: "marca", rotulo: "Marca & Pilares" },
  { id: "templates", rotulo: "Templates de IA" },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

export function Ajustes() {
  const { aba, secao, origem } = useSearch({ from: "/_authenticated/ajustes" });
  const navigate = useNavigate();

  const doPainel = origem === "painel";
  const inicial: AbaId = ABAS.some((a) => a.id === aba)
    ? (aba as AbaId)
    : secao === "contas"
      ? "contas"
      : "perfil";

  const ir = (id: AbaId) =>
    void navigate({ to: "/ajustes", search: { aba: id, secao, origem } });


  return (
    <Revelar className="space-y-4">
      <h1 className="secao-entrada text-lg font-bold">Ajustes</h1>

      {doPainel ? (
        <div className="secao-entrada">
          <FaixaDeContexto
            recorte="contas conectadas"
            onLimpar={() =>
              void navigate({ to: "/ajustes", search: { aba: inicial, secao: "", origem: "" } })
            }
          />
        </div>
      ) : null}

      <div className="secao-entrada flex flex-wrap gap-2">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => ir(a.id)}
            className={
              "h-[30px] shrink-0 rounded-[8px] border border-line px-3 text-xs transition-colors " +
              (inicial === a.id
                ? "bg-azure/16 font-medium text-white"
                : "text-muted hover:text-corpo")
            }
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {inicial === "perfil" && <AbaPerfil />}
      {inicial === "equipe" && <AbaEquipe />}
      {inicial === "contas" && <AbaContas />}
      {inicial === "marca" && <AbaMarca />}
      {inicial === "templates" && <AbaTemplates />}
    </Revelar>
  );
}

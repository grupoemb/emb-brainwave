import { useState } from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEquipe } from "@/hooks/useAjustes";
import { useOrg } from "@/hooks/useOrg";
import { PAPEIS, type Papel } from "@/lib/ajustes.functions";

const ROTULO_PAPEL: Record<Papel, string> = {
  owner: "Dono",
  admin: "Administrador",
  editor: "Editor",
  writer: "Redator",
  reviewer: "Revisor",
  viewer: "Leitor",
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function AbaEquipe() {
  const { isAdmin } = useOrg();
  const { membros, carregando, mudarPapel, excluir } = useEquipe();
  const [alvo, setAlvo] = useState<{ userId: string; nome: string } | null>(null);

  return (
    <div className="space-y-4">
      <div className="cartao secao-entrada max-w-2xl p-4 text-xs text-corpo">
        Novos membros: criam conta na tela de login e informam o código de acesso da equipe (o
        administrador tem o código).
      </div>

      <div className="cartao secao-entrada max-w-2xl p-2">
        {carregando ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 esqueleto rounded-[.5rem]" />
            ))}
          </div>
        ) : membros.length === 0 ? (
          <p className="p-6 text-sm text-muted">Nenhum membro na equipe ainda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {membros.map((m) => (
              <li key={m.userId} className="flex items-center gap-3 px-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-azure/15 text-xs font-bold text-azureClaro">
                  {iniciais(m.nome)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-txt">{m.nome}</span>

                {isAdmin ? (
                  <select
                    value={m.papel}
                    disabled={mudarPapel.isPending}
                    onChange={(e) =>
                      mudarPapel.mutate({ userId: m.userId, papel: e.target.value as Papel })
                    }
                    className="rounded-[.5rem] border border-line bg-bg2 px-2 py-1.5 text-xs text-corpo outline-none focus:border-azure"
                  >
                    {PAPEIS.map((p) => (
                      <option key={p} value={p}>
                        {ROTULO_PAPEL[p]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="pill pill-bom">{ROTULO_PAPEL[m.papel] ?? m.papel}</span>
                )}

                {isAdmin ? (
                  <button
                    onClick={() => setAlvo({ userId: m.userId, nome: m.nome })}
                    title="Remover da equipe"
                    className="rounded-[.5rem] p-2 text-muted transition-colors hover:bg-white/6 hover:text-ruim"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={!!alvo} onOpenChange={(aberto) => !aberto && setAlvo(null)}>
        <AlertDialogContent className="border-line bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {alvo?.nome} da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              A pessoa perde o acesso à Central de Conteúdo. Ela pode voltar entrando de novo com o
              código de acesso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (alvo) excluir.mutate(alvo.userId);
                setAlvo(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useEffect, useState } from "react";

import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { atualizarMeuPerfil, obterMeuPerfil } from "@/lib/perfil.functions";
import { mensagemErro } from "@/hooks/useAjustes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

const ROTULO_PAPEL: Record<string, string> = {
  owner: "Dono",
  admin: "Administrador",
  editor: "Editor",
  writer: "Redator",
  reviewer: "Revisor",
  viewer: "Leitor",
};

export function AbaPerfil() {
  const qc = useQueryClient();
  const buscar = useServerFn(obterMeuPerfil);
  const salvar = useServerFn(atualizarMeuPerfil);
  const { papel } = useOrg();
  const { data, isPending } = useQuery({ queryKey: ["meu-perfil"], queryFn: () => buscar() });

  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!data) return;
    setNome(data.nome ?? "");
    setAvatar(data.avatar_url ?? "");
  }, [data]);

  useEffect(() => {
    let vivo = true;
    void supabase.auth.getUser().then(({ data: u }) => {
      if (vivo) setEmail(u.user?.email ?? "");
    });
    return () => {
      vivo = false;
    };
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await salvar({ data: { nome, avatar_url: avatar } });
      await qc.invalidateQueries({ queryKey: ["meu-perfil"] });
      toast.success("Perfil atualizado");
    } catch (erro) {
      toast.error(mensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  if (isPending) {
    return <div className="cartao secao-entrada h-56 max-w-md animate-pulse p-6" />;
  }

  return (
    <div className="cartao secao-entrada max-w-md p-6">
      <div className="flex items-center justify-between">
        <div className="rotulo">Seu perfil</div>
        {papel ? <span className="pill pill-bom">{ROTULO_PAPEL[papel] ?? papel}</span> : null}
      </div>

      <form className="mt-4 flex flex-col gap-3" onSubmit={enviar}>
        <label className="flex flex-col gap-1 text-sm text-corpo">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt outline-none focus:border-azure"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-corpo">
          Email
          <input
            value={email}
            readOnly
            className="cursor-not-allowed rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-muted outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-corpo">
          URL do avatar (opcional)
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://…"
            className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt outline-none focus:border-azure"
          />
        </label>

        <button type="submit" disabled={salvando} className="btn-primario mt-1 px-4 py-2 text-sm">
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </div>
  );
}

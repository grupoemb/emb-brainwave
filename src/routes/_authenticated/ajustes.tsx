import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { atualizarMeuPerfil, obterMeuPerfil } from "@/lib/perfil.functions";

function Ajustes() {
  const queryClient = useQueryClient();
  const buscarPerfil = useServerFn(obterMeuPerfil);
  const salvarPerfil = useServerFn(atualizarMeuPerfil);
  const { data } = useQuery({ queryKey: ["meu-perfil"], queryFn: () => buscarPerfil() });

  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("");
  const [estado, setEstado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!data) return;
    setNome(data.nome ?? "");
    setAvatar(data.avatar_url ?? "");
  }, [data]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado(null);
    setSalvando(true);
    try {
      await salvarPerfil({ data: { nome, avatar_url: avatar } });
      await queryClient.invalidateQueries({ queryKey: ["meu-perfil"] });
      setEstado({ tipo: "ok", texto: "Perfil atualizado." });
    } catch {
      setEstado({ tipo: "erro", texto: "Não foi possível salvar. Verifique os campos." });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <h1 className="text-lg font-bold">Ajustes</h1>
      <div className="cartao mt-4 max-w-md p-6">
        <div className="rotulo">Seu perfil</div>
        <form className="mt-4 flex flex-col gap-3" onSubmit={enviar}>
          <label className="flex flex-col gap-1 text-sm">
            Nome
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm outline-none focus:border-azure"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            URL do avatar (opcional)
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://…"
              className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm outline-none focus:border-azure"
            />
          </label>
          {estado && (
            <p className={"text-sm " + (estado.tipo === "ok" ? "text-bom" : "text-ruim")}>
              {estado.texto}
            </p>
          )}
          <button type="submit" disabled={salvando} className="btn-primario mt-1 px-4 py-2 text-sm">
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_authenticated/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — Central de Conteúdo EMB" },
      { name: "description", content: "Configurações da Central de Conteúdo EMB." },
      { property: "og:title", content: "Ajustes — Central de Conteúdo EMB" },
      { property: "og:description", content: "Configurações da Central de Conteúdo EMB." },
    ],
  }),
  component: Ajustes,
});

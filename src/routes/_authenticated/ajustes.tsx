import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";
import { useContasConectadas } from "@/hooks/useMetricas";
import { atualizarMeuPerfil, obterMeuPerfil } from "@/lib/perfil.functions";

const buscaAjustes = z.object({
  secao: fallback(z.string(), "").default(""),
  origem: fallback(z.string(), "").default(""),
});

function ContasConectadas({ foco }: { foco: boolean }) {
  const contas = useContasConectadas();
  const alvo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (foco) alvo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [foco]);

  return (
    <div
      ref={alvo}
      className={
        "cartao mt-4 max-w-md p-6 transition-colors " + (foco ? "ring-1 ring-azure/40" : "")
      }
    >
      <div className="rotulo">Contas conectadas</div>
      <div className="mt-4 flex flex-col gap-2">
        {contas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma conta conectada ainda.</p>
        ) : (
          contas.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm text-corpo"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bom" />
              {c.handle}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Ajustes() {
  const queryClient = useQueryClient();
  const buscarPerfil = useServerFn(obterMeuPerfil);
  const salvarPerfil = useServerFn(atualizarMeuPerfil);
  const { data } = useQuery({ queryKey: ["meu-perfil"], queryFn: () => buscarPerfil() });
  const { secao, origem } = useSearch({ from: "/_authenticated/ajustes" });
  const navigate = useNavigate();

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

  const doPainel = origem === "painel";

  return (
    <section>
      <h1 className="text-lg font-bold">Ajustes</h1>

      {doPainel ? (
        <div className="mt-3">
          <FaixaDeContexto
            recorte="contas conectadas"
            onLimpar={() => void navigate({ to: "/ajustes", search: { secao: "", origem: "" } })}
          />
        </div>
      ) : null}

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

      <ContasConectadas foco={secao === "contas"} />
    </section>
  );
}

export const Route = createFileRoute("/_authenticated/ajustes")({
  validateSearch: zodValidator(buscaAjustes),
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

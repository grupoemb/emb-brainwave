import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

function traduzirErro(mensagem: string) {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já está cadastrado.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter no mínimo 6 caracteres.";
  if (m.includes("pwned") || m.includes("compromised"))
    return "Essa senha apareceu em vazamentos. Escolha outra.";
  if (m.includes("unable to validate email")) return "E-mail inválido.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um instante.";
  return "Não foi possível concluir. Tente novamente.";
}

function Acesso() {
  const navigate = useNavigate();
  const [aba, setAba] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (ativo && data.session) navigate({ to: "/", replace: true });
    });
    return () => {
      ativo = false;
    };
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (aba === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { nome: nome.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        const { error: erroLogin } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (erroLogin) throw erroLogin;
      }
      navigate({ to: "/", replace: true });
    } catch (e) {
      setErro(traduzirErro(e instanceof Error ? e.message : ""));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="cartao w-full max-w-sm p-8">
        <div className="text-lg font-bold">
          B7 · <span className="grad">Central</span> de Conteúdo
        </div>
        <p className="mt-1 text-sm text-muted">Acesso restrito à equipe EMB.</p>

        <div className="mt-6 flex gap-1 rounded-[.6rem] border border-line p-1">
          {(["entrar", "criar"] as const).map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => {
                setAba(valor);
                setErro(null);
              }}
              className={
                "flex-1 rounded-[.45rem] px-3 py-1.5 text-sm transition-colors " +
                (aba === valor ? "bg-azure/14 font-semibold text-white" : "text-muted")
              }
            >
              {valor === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form className="mt-5 flex flex-col gap-3" onSubmit={enviar}>
          {aba === "criar" && (
            <label className="flex flex-col gap-1 text-sm">
              Nome
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
                className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm outline-none focus:border-azure"
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm outline-none focus:border-azure"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete={aba === "entrar" ? "current-password" : "new-password"}
              className="rounded-[.5rem] border border-line bg-bg2 px-3 py-2 text-sm outline-none focus:border-azure"
            />
          </label>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button type="submit" disabled={enviando} className="btn mt-2 justify-center">
            {enviando ? "Aguarde…" : aba === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso — Central de Conteúdo EMB" },
      { name: "description", content: "Entre na Central de Conteúdo EMB para gerenciar pautas, calendário e produção." },
      { property: "og:title", content: "Acesso — Central de Conteúdo EMB" },
      {
        property: "og:description",
        content: "Entre na Central de Conteúdo EMB para gerenciar pautas, calendário e produção.",
      },
    ],
  }),
  component: Acesso,
});

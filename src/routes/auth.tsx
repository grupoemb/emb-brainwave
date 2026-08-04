import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, KeyRound, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";

import { CampoAcesso } from "@/components/acesso/CampoAcesso";
import { VitrineFundo } from "@/components/acesso/VitrineFundo";
import { supabase } from "@/integrations/supabase/client";
import { entrarNaOrganizacao } from "@/lib/organizacao";


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
  const [codigo, setCodigo] = useState("");
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
            data: { full_name: nome.trim(), nome: nome.trim() },
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
      const entrada = await entrarNaOrganizacao(codigo);
      if (!entrada.ok) {
        await supabase.auth.signOut();
        setErro(
          entrada.error?.toLowerCase().includes("código")
            ? "Código de acesso inválido. Peça o código à equipe."
            : entrada.error || "Não foi possível liberar seu acesso à equipe.",
        );
        return;
      }

      navigate({ to: "/", replace: true });
    } catch (e) {
      setErro(traduzirErro(e instanceof Error ? e.message : ""));
    } finally {
      setEnviando(false);
    }
  }

  const criando = aba === "criar";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <VitrineFundo />

      <div className="relative w-full max-w-[26rem]">
        <div
          className="acesso-sobe rounded-[1.1rem] border border-lineForte bg-card/80 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,.85)] backdrop-blur-xl sm:p-8"
          style={{ animationDelay: ".05s" }}
        >
          <div
            aria-hidden
            className="mx-auto -mt-7 mb-6 h-px w-2/3 bg-gradient-to-r from-transparent via-azure to-transparent"
          />

          <div className="flex flex-col items-center text-center">
            <LogoB7 altura={42} />
            <p className="rotulo mt-3.5">Central de Conteúdo</p>
            <p className="mt-2.5 max-w-[30rem] text-sm leading-relaxed text-corpo">
              Cérebro artificial para criação, gestão e análises de conteúdo para redes sociais.
            </p>
            <p className="mt-1 text-xs text-muted">Acesso restrito à equipe B7.</p>
          </div>


          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Instagram", "LinkedIn", "TikTok"].map((c) => (
              <span key={c} className="pill border border-line text-[.68rem] text-corpo">
                {c}
              </span>
            ))}
          </div>

          <div className="relative mt-6 grid grid-cols-2 rounded-[.65rem] border border-line bg-bg2/60 p-1">
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-.25rem)] rounded-[.5rem] bg-gradient-to-r from-royal/70 to-azure/60 transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)]"
              style={{ transform: criando ? "translateX(100%)" : "translateX(0)" }}
            />
            {(["entrar", "criar"] as const).map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => {
                  setAba(valor);
                  setErro(null);
                }}
                className={
                  "relative z-10 rounded-[.5rem] px-3 py-1.5 text-sm transition-colors " +
                  (aba === valor ? "font-semibold text-white" : "text-muted hover:text-corpo")
                }
              >
                {valor === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form className="mt-5 flex flex-col gap-3.5" onSubmit={enviar}>
            {criando && (
              <div className="acesso-sobe" style={{ animationDelay: ".02s" }}>
                <CampoAcesso
                  rotulo="Nome"
                  icone={User}
                  valor={nome}
                  onChange={setNome}
                  obrigatorio
                  autoComplete="name"
                  placeholder="Como a equipe te chama"
                />
              </div>
            )}

            <div className="acesso-sobe" style={{ animationDelay: ".14s" }}>
              <CampoAcesso
                rotulo="E-mail"
                icone={Mail}
                tipo="email"
                valor={email}
                onChange={setEmail}
                obrigatorio
                autoComplete="email"
                placeholder="voce@embmarketing.com"
              />
            </div>

            <div className="acesso-sobe" style={{ animationDelay: ".19s" }}>
              <CampoAcesso
                rotulo="Senha"
                icone={Lock}
                tipo="password"
                valor={senha}
                onChange={setSenha}
                obrigatorio
                minLength={6}
                autoComplete={criando ? "new-password" : "current-password"}
                placeholder="Mínimo de 6 caracteres"
              />
            </div>

            {criando && (
              <div className="acesso-sobe" style={{ animationDelay: ".24s" }}>
                <CampoAcesso
                  rotulo="Código de acesso da equipe"
                  icone={KeyRound}
                  valor={codigo}
                  onChange={setCodigo}
                  autoComplete="off"
                  placeholder="Ex.: EMB-2026"
                  dica="Peça o código a quem já usa a Central."
                />
              </div>
            )}

            {erro && (
              <div className="acesso-sobe flex items-start gap-2 rounded-[.6rem] border border-ruim/30 bg-ruim/10 px-3 py-2.5">
                <AlertCircle size={15} className="mt-px shrink-0 text-ruim" />
                <p className="text-[.8rem] leading-snug text-corpo">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="btn-primario mt-1 flex h-11 w-full items-center justify-center gap-2 text-sm transition-all duration-200 hover:brightness-110 hover:shadow-[0_10px_30px_-12px_rgba(0,164,255,.8)] disabled:opacity-60"
            >
              {enviando && <Loader2 size={15} className="animate-spin" />}
              {enviando ? "Aguarde…" : criando ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-line pt-4 text-[.7rem] text-muted">
            <ShieldCheck size={12} className="text-bom" />
            Uso interno · dados protegidos por RLS
          </div>
        </div>
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

import { supabase } from "@/integrations/supabase/client";

export type ResultadoEntrada = {
  ok: boolean;
  error?: string;
  organization_id?: string;
  role?: string;
  founder?: boolean;
  already_member?: boolean;
};

/**
 * Garante que o usuário autenticado pertence à organização,
 * usando a RPC existente `join_organization` do banco.
 */
export async function entrarNaOrganizacao(codigo?: string): Promise<ResultadoEntrada> {
  const limpo = codigo?.trim();
  const { data, error } = await supabase.rpc(
    "join_organization",
    limpo ? { p_code: limpo } : {},
  );

  if (error) return { ok: false, error: error.message };
  return (data ?? { ok: false, error: "resposta inválida" }) as unknown as ResultadoEntrada;
}

import { redirect } from "next/navigation";
import { createClient, supabaseConfigurado } from "./supabase/server";
import type { Profile } from "./types";

/** Usuário logado + perfil. Redireciona para /entrar se não houver sessão. */
export async function getContexto() {
  if (!supabaseConfigurado) redirect("/?erro=config");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/entrar?erro=" + encodeURIComponent("Perfil não encontrado. Entre de novo."));

  return { supabase, user, profile: profile as Profile };
}

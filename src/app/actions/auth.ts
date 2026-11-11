"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { texto } from "@/lib/utils";

const comErro = (rota: string, msg: string) => `${rota}?erro=${encodeURIComponent(msg)}`;

function traduzir(msg: string): string {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered|already exists/i.test(msg)) return "Já existe uma conta com esse e-mail.";
  if (/password.*(6|short|least)/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/email.*not.*confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Espere um minuto e tente de novo.";
  return msg;
}

export async function entrar(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: texto(formData, "email"),
    password: texto(formData, "senha"),
  });
  if (error) redirect(comErro("/entrar", traduzir(error.message)));
  redirect("/painel");
}

export async function cadastrar(formData: FormData) {
  const role = texto(formData, "role");
  const nome = texto(formData, "nome");
  if (!["profissional", "empresa", "fornecedor"].includes(role)) redirect(comErro("/cadastro", "Escolha como você quer usar o app."));
  if (!nome) redirect(comErro("/cadastro", "Informe seu nome ou o nome do negócio."));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: texto(formData, "email"),
    password: texto(formData, "senha"),
    options: {
      data: {
        role,
        nome,
        regiao: texto(formData, "regiao") || null,
        funcao: role === "profissional" ? texto(formData, "funcao") || null : null,
      },
    },
  });
  if (error) redirect(comErro("/cadastro", traduzir(error.message)));
  if (!data.session) redirect("/entrar?msg=" + encodeURIComponent("Conta criada! Confirme o e-mail que enviamos e depois entre."));
  redirect("/painel?msg=" + encodeURIComponent("Bem-vindo(a) ao Chef's Match!"));
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

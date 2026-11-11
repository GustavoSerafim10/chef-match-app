import Link from "next/link";
import { cadastrar } from "@/app/actions/auth";
import { Logo, Notice, btn, input, label, lerAvisos, type SP } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { FUNCOES, REGIOES } from "@/lib/constants";

export const metadata = { title: "Criar conta · Chef's Match" };

const opcoes = [
  { v: "profissional", t: "Quero trabalhar", d: "Vagas, extras e cursos. Sempre grátis." },
  { v: "empresa", t: "Preciso contratar", d: "Restaurante, bar, hotel, padaria…" },
  { v: "fornecedor", t: "Sou fornecedor", d: "Catálogo e cotações de restaurantes." },
];

export default async function Cadastro({ searchParams }: { searchParams: SP }) {
  const { erro, sp } = await lerAvisos(searchParams);
  const rolePadrao = typeof sp.role === "string" ? sp.role : "profissional";

  return (
    <main className="mx-auto grid w-full max-w-lg flex-1 content-center gap-8 px-4 py-10">
      <Link href="/">
        <Logo />
      </Link>
      <div>
        <h1 className="font-display text-5xl font-bold uppercase leading-none">Criar conta</h1>
        <p className="mt-2 text-soft">Leva menos de um minuto.</p>
      </div>
      <Notice erro={erro} />
      <form action={cadastrar} className="grid gap-5">
        <fieldset className="grid gap-2">
          <legend className={`${label} mb-2`}>Como você vai usar o app?</legend>
          {opcoes.map((o) => (
            <label
              key={o.v}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-line bg-ink-2 p-4 transition has-checked:border-orange has-checked:bg-orange/10"
            >
              <input
                type="radio"
                name="role"
                value={o.v}
                defaultChecked={o.v === rolePadrao}
                className="peer mt-1 accent-orange"
              />
              <span>
                <span className="block font-bold">{o.t}</span>
                <span className="text-sm text-muted">{o.d}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="grid gap-1.5">
          <span className={label}>Seu nome ou nome do negócio</span>
          <input id="nome" name="nome" required className={input} placeholder="Ex.: João Silva ou Bistrô Asa Norte" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={label}>Região</span>
            <select id="regiao" name="regiao" className={input} defaultValue="">
              <option value="">Selecione</option>
              {REGIOES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className={label}>Função (se for profissional)</span>
            <select id="funcao" name="funcao" className={input} defaultValue="">
              <option value="">Selecione</option>
              {FUNCOES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={label}>E-mail</span>
          <input id="email" name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="grid gap-1.5">
          <span className={label}>Senha (mínimo 6 caracteres)</span>
          <input id="senha" name="senha" type="password" required minLength={6} autoComplete="new-password" className={input} />
        </label>

        <SubmitButton className={`${btn} mt-2`} pendingText="Criando conta…">
          Criar minha conta
        </SubmitButton>
        <p className="text-xs text-muted">
          Ao criar a conta você concorda em usar o app de forma ética. Seus dados seguem a LGPD e não são vendidos.
        </p>
      </form>
      <p className="text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-bold text-orange">
          Entrar
        </Link>
      </p>
    </main>
  );
}

import Link from "next/link";
import { entrar } from "@/app/actions/auth";
import { Logo, Notice, btn, input, label, lerAvisos, type SP } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DemoButtons } from "@/components/demo-buttons";

export const metadata = { title: "Entrar · Chef's Match" };

export default async function Entrar({ searchParams }: { searchParams: SP }) {
  const { erro, msg } = await lerAvisos(searchParams);
  return (
    <main className="mx-auto grid w-full max-w-xl flex-1 content-center gap-8 px-4 py-10">
      <Link href="/">
        <Logo />
      </Link>
      <div>
        <h1 className="font-display text-5xl font-bold uppercase leading-none">Entrar</h1>
        <p className="mt-2 text-soft">Bom te ver de novo.</p>
      </div>
      <Notice erro={erro} msg={msg} />
      <form action={entrar} className="grid gap-4">
        <label className="grid gap-1.5">
          <span className={label}>E-mail</span>
          <input id="email" name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="grid gap-1.5">
          <span className={label}>Senha</span>
          <input id="senha" name="senha" type="password" required autoComplete="current-password" className={input} />
        </label>
        <SubmitButton className={`${btn} mt-2`} pendingText="Entrando…">
          Entrar
        </SubmitButton>
      </form>
      <p className="text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-bold text-orange">
          Criar conta grátis
        </Link>
      </p>
      <div className="border-t border-line pt-6">
        <DemoButtons titulo="Ou teste com um clique" />
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo, btn, btnGhost, lerAvisos, type SP } from "@/components/ui";
import { DemoButtons } from "@/components/demo-buttons";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

const pilares = [
  { t: "Talentos", d: "Vagas fixas, temporárias e extras. Botão “Preciso de alguém hoje” com compatibilidade explicada." },
  { t: "Fornecedores", d: "Peça cotação uma vez, receba propostas e compare preço e prazo lado a lado." },
  { t: "Qualidade", d: "Avaliação nos dois sentidos, só depois de uma experiência real no app." },
];

export default async function Home({ searchParams }: { searchParams: SP }) {
  const { erro } = await lerAvisos(searchParams);

  if (supabaseConfigurado) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/painel");
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(240,120,50,.25), transparent 65%)" }}
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/entrar" className="text-sm font-bold text-soft hover:text-paper">
            Entrar
          </Link>
        </header>

        {(erro === "config" || !supabaseConfigurado) && (
          <div className="mt-6 rounded-xl bg-warn/15 px-4 py-3 text-sm font-semibold text-warn">
            Falta configurar o Supabase: crie o arquivo .env.local a partir do .env.example.
          </div>
        )}

        <section className="grid flex-1 content-center gap-8 py-12">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">
            FoodTech + RH Tech · Brasília, DF
          </p>
          <h1 className="font-display text-6xl font-bold uppercase leading-[0.9] sm:text-8xl">
            A gastronomia <span className="text-orange">se conecta</span> aqui.
          </h1>
          <p className="max-w-xl text-lg text-soft">
            Quem trabalha, quem contrata e quem fornece para a gastronomia, no mesmo app. Grátis para profissionais.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/cadastro?role=profissional" className={btn}>
              Quero trabalhar
            </Link>
            <Link href="/cadastro?role=empresa" className={btnGhost}>
              Preciso contratar
            </Link>
            <Link href="/cadastro?role=fornecedor" className={btnGhost}>
              Sou fornecedor
            </Link>
          </div>
        </section>

        <div className="pb-10">
          <DemoButtons />
        </div>

        <section className="grid gap-4 pb-6 sm:grid-cols-3">
          {pilares.map((p) => (
            <div key={p.t} className="rounded-2xl border border-line bg-ink-2/80 p-5">
              <h2 className="font-display text-2xl font-bold uppercase text-orange">{p.t}</h2>
              <p className="mt-2 text-sm text-soft">{p.d}</p>
            </div>
          ))}
        </section>
        <p className="pb-2 text-xs text-muted">Projeto acadêmico · Brasília, DF · 2026</p>
      </div>
    </main>
  );
}

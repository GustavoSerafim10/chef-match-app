import { entrarDemo } from "@/app/actions/auth";
import { SubmitButton } from "./submit-button";

const PERFIS = [
  { v: "empresa", icone: "🍽️", t: "Restaurante", d: "Bistrô Cerrado · contrate hoje" },
  { v: "profissional", icone: "👨‍🍳", t: "Profissional", d: "Lucas Mendes · garçom" },
  { v: "fornecedor", icone: "🚚", t: "Fornecedor", d: "Carnes Nobre DF · cotações" },
];

/** Entra com um clique numa conta de demonstração. */
export function DemoButtons({ titulo = "Testar sem cadastro" }: { titulo?: string }) {
  return (
    <section aria-label="Modo demonstração" className="grid gap-3">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">{titulo}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {PERFIS.map((p) => (
          <form key={p.v} action={entrarDemo}>
            <input type="hidden" name="perfil" value={p.v} />
            <SubmitButton
              pendingText="Entrando…"
              className="flex h-full w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-ink-2 p-4 text-left transition hover:border-orange disabled:opacity-60"
            >
              <span className="text-2xl" aria-hidden="true">
                {p.icone}
              </span>
              <span>
                <span className="block font-bold">Testar como {p.t.toLowerCase()}</span>
                <span className="block text-xs text-muted">{p.d}</span>
              </span>
            </SubmitButton>
          </form>
        ))}
      </div>
      <p className="text-xs text-muted">Contas de demonstração com dados fictícios de Brasília. Tudo o que você fizer lá é só para teste.</p>
    </section>
  );
}

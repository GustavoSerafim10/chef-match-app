import Link from "next/link";
import { criarProduto, removerProduto } from "@/app/actions/app";
import { SubmitButton } from "@/components/submit-button";
import { Empty, Notice, PageTitle, Pill, SectionTitle, Stars, btn, card, input, label, lerAvisos, type SP } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { CATEGORIAS } from "@/lib/constants";
import type { Produto, Profile, Reputacao } from "@/lib/types";
import { mapaReputacao, reais } from "@/lib/utils";

export const metadata = { title: "Catálogo · Chef's Match" };

export default async function Produtos({ searchParams }: { searchParams: SP }) {
  const { erro, msg, sp } = await lerAvisos(searchParams);
  const { supabase, profile } = await getContexto();

  if (profile.role === "fornecedor") {
    const { data } = await supabase.from("produtos").select("*").eq("fornecedor_id", profile.id).order("categoria");
    const produtos = (data ?? []) as Produto[];
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Notice erro={erro} msg={msg} />
          <PageTitle eyebrow="Fornecedor" title="Meu catálogo">
            Restaurantes encontram você pelo que você vende. Preço é opcional: você pode mandar na cotação.
          </PageTitle>
          <form action={criarProduto} className="grid gap-4">
            <label className="grid gap-1.5">
              <span className={label}>Produto</span>
              <input id="nome" name="nome" required className={input} placeholder="Tomate italiano" />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="col-span-3 grid gap-1.5 sm:col-span-1">
                <span className={label}>Categoria</span>
                <select id="categoria" name="categoria" className={input}>
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className={label}>Unidade</span>
                <input id="unidade" name="unidade" className={input} placeholder="kg" />
              </label>
              <label className="col-span-2 grid gap-1.5 sm:col-span-1">
                <span className={label}>Preço (R$)</span>
                <input id="preco" name="preco" inputMode="decimal" className={input} placeholder="6,90" />
              </label>
            </div>
            <SubmitButton className={btn} pendingText="Salvando…">
              Adicionar ao catálogo
            </SubmitButton>
          </form>
        </div>
        <div>
          <SectionTitle>{produtos.length} produto{produtos.length === 1 ? "" : "s"}</SectionTitle>
          {produtos.length === 0 ? (
            <Empty title="Catálogo vazio">Adicione os produtos que você mais vende.</Empty>
          ) : (
            <div className="grid gap-2">
              {produtos.map((p) => (
                <div key={p.id} className={`${card} flex items-center justify-between gap-3 py-3`}>
                  <span>
                    <span className="block font-semibold">{p.nome}</span>
                    <span className="text-sm text-muted">
                      {p.categoria} · {p.preco ? `${reais(Number(p.preco))}/${p.unidade}` : `por ${p.unidade}`}
                    </span>
                  </span>
                  <form action={removerProduto}>
                    <input type="hidden" name="id" value={p.id} />
                    <SubmitButton className="text-sm font-semibold text-muted hover:text-bad cursor-pointer" pendingText="…">
                      Remover
                    </SubmitButton>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estabelecimento (e profissional): navegar pelos fornecedores
  const categoria = typeof sp.categoria === "string" ? sp.categoria : "";
  let q = supabase.from("produtos").select("*, fornecedor:profiles!produtos_fornecedor_id_fkey(id, nome, regiao)").limit(200);
  if (categoria) q = q.eq("categoria", categoria);
  const { data } = await q;
  const produtos = (data ?? []) as (Produto & { fornecedor: Pick<Profile, "id" | "nome" | "regiao"> })[];
  const porFornecedor = new Map<string, { f: Pick<Profile, "id" | "nome" | "regiao">; itens: Produto[] }>();
  for (const p of produtos) {
    const g = porFornecedor.get(p.fornecedor_id) ?? { f: p.fornecedor, itens: [] };
    g.itens.push(p);
    porFornecedor.set(p.fornecedor_id, g);
  }
  const { data: reps } = await supabase.from("reputacao").select("*").in("perfil_id", [...porFornecedor.keys()]);
  const repMap = mapaReputacao(reps as Reputacao[]);

  return (
    <>
      <Notice erro={erro} msg={msg} />
      <PageTitle eyebrow="Fornecedores" title="Catálogo">
        Fornecedores de Brasília e o que eles vendem. Achou? Peça uma cotação.
      </PageTitle>
      <nav aria-label="Filtrar por categoria" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href="/produtos" className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${!categoria ? "bg-orange text-ink" : "bg-ink-3 text-soft"}`}>
          Todas
        </Link>
        {CATEGORIAS.map((c) => (
          <Link
            key={c}
            href={`/produtos?categoria=${encodeURIComponent(c)}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${categoria === c ? "bg-orange text-ink" : "bg-ink-3 text-soft"}`}
          >
            {c}
          </Link>
        ))}
      </nav>
      {porFornecedor.size === 0 ? (
        <Empty title="Nenhum fornecedor nessa categoria ainda" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...porFornecedor.values()].map(({ f, itens }) => {
            const r = repMap.get(f.id);
            return (
              <div key={f.id} className={`${card} grid gap-3`}>
                <Link href={`/perfil/${f.id}`}>
                  <span className="block font-bold">{f.nome}</span>
                  <span className="text-sm text-muted">{f.regiao ?? "Brasília"}</span>
                </Link>
                <Stars media={r?.media} total={r?.total} />
                <div className="flex flex-wrap gap-1.5">
                  {itens.slice(0, 8).map((p) => (
                    <Pill key={p.id}>
                      {p.nome}
                      {p.preco ? ` · ${reais(Number(p.preco))}` : ""}
                    </Pill>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {profile.role === "empresa" && (
        <Link href="/cotacoes" className={`${btn} mt-6`}>
          Pedir cotação
        </Link>
      )}
    </>
  );
}

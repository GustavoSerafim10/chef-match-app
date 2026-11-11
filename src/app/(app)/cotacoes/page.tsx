import Link from "next/link";
import { criarCotacao } from "@/app/actions/app";
import { SubmitButton } from "@/components/submit-button";
import { Empty, Notice, PageTitle, Pill, SectionTitle, btn, card, input, label, lerAvisos, type SP } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { CATEGORIAS } from "@/lib/constants";
import type { Cotacao, Profile, Proposta } from "@/lib/types";
import { dataCurta } from "@/lib/utils";

export const metadata = { title: "Cotações · Chef's Match" };

export default async function Cotacoes({ searchParams }: { searchParams: SP }) {
  const { erro, msg } = await lerAvisos(searchParams);
  const { supabase, profile } = await getContexto();

  if (profile.role === "empresa") {
    const { data } = await supabase
      .from("cotacoes")
      .select("*, propostas(id, aceita)")
      .eq("empresa_id", profile.id)
      .order("created_at", { ascending: false });
    const cotacoes = (data ?? []) as (Cotacao & { propostas: Pick<Proposta, "id" | "aceita">[] })[];
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <Notice erro={erro} msg={msg} />
          <PageTitle eyebrow="Fornecedores" title="Pedir cotação">
            Liste o que precisa uma vez só. Os fornecedores enviam propostas e você compara preço e prazo.
          </PageTitle>
          <form action={criarCotacao} className="grid gap-4">
            <label className="grid gap-1.5">
              <span className={label}>Título</span>
              <input id="titulo" name="titulo" required className={input} placeholder="Hortifruti da semana" />
            </label>
            <label className="grid gap-1.5">
              <span className={label}>Categoria</span>
              <select id="categoria" name="categoria" className={input} defaultValue="">
                <option value="">Várias</option>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className={label}>Itens e quantidades</span>
              <textarea
                id="itens"
                name="itens"
                required
                rows={6}
                className={input}
                placeholder={"Tomate italiano: 20 kg\nBatata lavada: 30 kg\nCebola: 15 kg\nAlface americana: 8 caixas"}
              />
            </label>
            <SubmitButton className={btn} pendingText="Enviando…">
              Enviar para fornecedores
            </SubmitButton>
          </form>
        </div>
        <div>
          <SectionTitle>Minhas cotações</SectionTitle>
          {cotacoes.length === 0 ? (
            <Empty title="Nenhuma cotação ainda">A primeira leva menos de um minuto.</Empty>
          ) : (
            <div className="grid gap-2">
              {cotacoes.map((c) => (
                <Link key={c.id} href={`/cotacoes/${c.id}`} className={`${card} flex items-center justify-between gap-3 py-4 hover:border-muted`}>
                  <span>
                    <span className="block font-semibold">{c.titulo}</span>
                    <span className="text-sm text-muted">{dataCurta(c.created_at)}</span>
                  </span>
                  {c.propostas.some((p) => p.aceita) ? (
                    <Pill tone="ok">Pedido aprovado</Pill>
                  ) : (
                    <Pill tone={c.propostas.length ? "orange" : "neutral"}>
                      {c.propostas.length} proposta{c.propostas.length === 1 ? "" : "s"}
                    </Pill>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (profile.role === "fornecedor") {
    const [{ data }, { data: minhas }] = await Promise.all([
      supabase
        .from("cotacoes")
        .select("*, empresa:profiles!cotacoes_empresa_id_fkey(nome, regiao)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("propostas").select("cotacao_id, aceita").eq("fornecedor_id", profile.id),
    ]);
    const estado = new Map(((minhas ?? []) as Pick<Proposta, "cotacao_id" | "aceita">[]).map((p) => [p.cotacao_id, p.aceita]));
    const cotacoes = ((data ?? []) as (Cotacao & { empresa: Pick<Profile, "nome" | "regiao"> })[]).filter(
      (c) => c.status === "aberta" || estado.has(c.id),
    );
    return (
      <>
        <Notice erro={erro} msg={msg} />
        <PageTitle eyebrow="Marketplace" title="Cotações">
          Restaurantes de Brasília pedindo preço. Responda rápido: quem responde primeiro costuma ganhar o pedido.
        </PageTitle>
        {cotacoes.length === 0 ? (
          <Empty title="Nenhuma cotação aberta agora">Volte mais tarde ou complete seu catálogo.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cotacoes.map((c) => (
              <Link key={c.id} href={`/cotacoes/${c.id}`} className={`${card} grid gap-1 hover:border-muted`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{c.titulo}</p>
                  {!estado.has(c.id) ? (
                    <Pill tone="orange">Responder</Pill>
                  ) : estado.get(c.id) ? (
                    <Pill tone="ok">Você ganhou</Pill>
                  ) : (
                    <Pill>Proposta enviada</Pill>
                  )}
                </div>
                <p className="text-sm text-muted">
                  {c.empresa.nome}
                  {c.empresa.regiao && ` · ${c.empresa.regiao}`} · {dataCurta(c.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </>
    );
  }

  return <Empty title="Cotações são para estabelecimentos e fornecedores" href="/painel" cta="Voltar ao início" />;
}

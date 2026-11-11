import Link from "next/link";
import { notFound } from "next/navigation";
import { aceitarProposta, enviarProposta } from "@/app/actions/app";
import { AvaliarForm } from "@/components/avaliar-form";
import { SubmitButton } from "@/components/submit-button";
import { Avatar, Empty, Notice, Pill, SectionTitle, Stars, btn, btnSm, card, input, label, lerAvisos, type SP } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import type { Cotacao, Profile, Proposta, Reputacao } from "@/lib/types";
import { dataCurta, mapaReputacao, reais } from "@/lib/utils";

export const metadata = { title: "Cotação · Chef's Match" };

type PropComFornecedor = Proposta & { fornecedor: Pick<Profile, "id" | "nome" | "regiao" | "telefone"> };

export default async function CotacaoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const { id } = await params;
  const { erro, msg, sp } = await lerAvisos(searchParams);
  const { supabase, profile } = await getContexto();
  const rota = `/cotacoes/${id}`;

  const { data: cotData } = await supabase
    .from("cotacoes")
    .select("*, empresa:profiles!cotacoes_empresa_id_fkey(id, nome, regiao, telefone)")
    .eq("id", id)
    .maybeSingle();
  if (!cotData) notFound();
  const cot = cotData as Cotacao & { empresa: Pick<Profile, "id" | "nome" | "regiao" | "telefone"> };
  const souDona = cot.empresa_id === profile.id;

  const { data: propData } = await supabase
    .from("propostas")
    .select("*, fornecedor:profiles!propostas_fornecedor_id_fkey(id, nome, regiao, telefone)")
    .eq("cotacao_id", id);
  const propostas = (propData ?? []) as PropComFornecedor[];
  const { data: reps } = await supabase
    .from("reputacao")
    .select("*")
    .in("perfil_id", [cot.empresa_id, ...propostas.map((p) => p.fornecedor_id)]);
  const repMap = mapaReputacao(reps as Reputacao[]);
  const { data: minhasAval } = await supabase.from("avaliacoes").select("referencia_id").eq("autor_id", profile.id);
  const avaliadas = new Set(((minhasAval ?? []) as { referencia_id: string }[]).map((a) => a.referencia_id));

  const ordem = sp.ordem === "prazo" || sp.ordem === "nota" ? sp.ordem : "preco";
  const ordenadas = [...propostas].sort((a, b) => {
    if (a.aceita !== b.aceita) return a.aceita ? -1 : 1; // pedido aprovado sempre no topo
    if (ordem === "prazo") return a.prazo_dias - b.prazo_dias || a.preco_total - b.preco_total;
    if (ordem === "nota") return Number(repMap.get(b.fornecedor_id)?.media ?? 0) - Number(repMap.get(a.fornecedor_id)?.media ?? 0);
    return a.preco_total - b.preco_total;
  });
  const minha = propostas.find((p) => p.fornecedor_id === profile.id);
  const aceita = propostas.find((p) => p.aceita);
  const repEmpresa = repMap.get(cot.empresa_id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <div>
        <Notice erro={erro} msg={msg} />
        <Link href="/cotacoes" className="text-sm font-semibold text-muted hover:text-paper">
          ← Cotações
        </Link>
        <div className={`${card} mt-3 grid gap-3`}>
          <div className="flex flex-wrap items-center gap-2">
            {cot.categoria && <Pill>{cot.categoria}</Pill>}
            <Pill tone={cot.status === "aberta" ? "orange" : "ok"}>{cot.status === "aberta" ? "Recebendo propostas" : "Pedido fechado"}</Pill>
          </div>
          <h1 className="font-display text-4xl font-bold uppercase leading-none">{cot.titulo}</h1>
          <div className="flex items-center gap-3">
            <Avatar nome={cot.empresa.nome} size={36} />
            <span>
              <span className="block font-semibold">{cot.empresa.nome}</span>
              <Stars media={repEmpresa?.media} total={repEmpresa?.total} />
            </span>
          </div>
          <div className="rounded-xl bg-ink p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Lista de compras</p>
            <p className="whitespace-pre-line font-mono text-sm leading-relaxed">{cot.itens}</p>
          </div>
          <p className="text-xs text-muted">Pedida em {dataCurta(cot.created_at)}</p>
        </div>
      </div>

      <div>
        {souDona && (
          <>
            <SectionTitle>
              {propostas.length} proposta{propostas.length === 1 ? "" : "s"}
            </SectionTitle>
            {propostas.length > 1 && (
              <div className="mb-4 flex w-fit rounded-full border border-line bg-ink-2 p-1" role="group" aria-label="Ordenar propostas">
                {[
                  ["preco", "Menor preço"],
                  ["prazo", "Mais rápido"],
                  ["nota", "Melhor avaliado"],
                ].map(([v, t]) => (
                  <Link
                    key={v}
                    href={`${rota}?ordem=${v}`}
                    aria-current={ordem === v ? "true" : undefined}
                    className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted aria-[current=true]:bg-paper aria-[current=true]:text-ink"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
            {propostas.length === 0 ? (
              <Empty title="Aguardando propostas">Os fornecedores cadastrados já estão vendo sua lista.</Empty>
            ) : (
              <div className="grid gap-3">
                {ordenadas.map((p, i) => {
                  const r = repMap.get(p.fornecedor_id);
                  const destaque = !aceita && i === 0;
                  return (
                    <div key={p.id} className={`${card} grid gap-3 ${p.aceita || destaque ? "border-2 border-orange" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/perfil/${p.fornecedor_id}`}>
                          <span className="block font-bold">{p.fornecedor.nome}</span>
                          <Stars media={r?.media} total={r?.total} />
                        </Link>
                        {p.aceita ? <Pill tone="ok">Aprovada</Pill> : destaque && <Pill tone="orange">Melhor opção</Pill>}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-display text-3xl font-bold">{reais(Number(p.preco_total))}</span>
                        <span className="text-sm text-soft">
                          entrega em {p.prazo_dias} dia{p.prazo_dias === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="text-sm text-muted">
                        Frete: {p.frete || "não informado"} · Pagamento: {p.pagamento || "a combinar"}
                      </p>
                      {!aceita && cot.status === "aberta" && (
                        <form action={aceitarProposta}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="cotacao_id" value={cot.id} />
                          <SubmitButton className={btnSm} pendingText="…">
                            Aprovar pedido
                          </SubmitButton>
                        </form>
                      )}
                      {p.aceita && (
                        <>
                          {p.fornecedor.telefone && (
                            <p className="text-sm text-soft">
                              Contato: <span className="font-mono font-semibold text-paper">{p.fornecedor.telefone}</span>
                            </p>
                          )}
                          {!avaliadas.has(p.id) && (
                            <AvaliarForm avaliadoId={p.fornecedor_id} avaliadoNome={p.fornecedor.nome} contexto="cotacao" referenciaId={p.id} voltar={rota} />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-xs text-muted">
              Na versão comercial, o pagamento passa por um provedor com split: o fornecedor recebe e o Chef&apos;s Match retém de 2% a 5%.
            </p>
          </>
        )}

        {profile.role === "fornecedor" && (
          <>
            {minha ? (
              <div className={`${card} mt-0 grid gap-3 lg:mt-14`}>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">Sua proposta</p>
                <p className="font-display text-3xl font-bold">{reais(Number(minha.preco_total))}</p>
                <p className="text-sm text-soft">
                  Entrega em {minha.prazo_dias} dia(s) · Frete: {minha.frete || "não informado"} · {minha.pagamento || "pagamento a combinar"}
                </p>
                <Pill tone={minha.aceita ? "ok" : aceita ? "bad" : "warn"}>
                  {minha.aceita ? "Pedido aprovado!" : aceita ? "Outro fornecedor foi escolhido" : "Aguardando o restaurante"}
                </Pill>
                {minha.aceita && cot.empresa.telefone && (
                  <p className="text-sm text-soft">
                    Contato do restaurante: <span className="font-mono font-semibold text-paper">{cot.empresa.telefone}</span>
                  </p>
                )}
                {minha.aceita && !avaliadas.has(minha.id) && (
                  <AvaliarForm avaliadoId={cot.empresa_id} avaliadoNome={cot.empresa.nome} contexto="cotacao" referenciaId={minha.id} voltar={rota} />
                )}
              </div>
            ) : cot.status === "aberta" ? (
              <form action={enviarProposta} className={`${card} grid gap-4 lg:mt-14`}>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">Enviar proposta</p>
                <input type="hidden" name="cotacao_id" value={cot.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className={label}>Preço total (R$)</span>
                    <input id="preco_total" name="preco_total" required inputMode="decimal" className={input} placeholder="395,00" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className={label}>Entrega em (dias)</span>
                    <input id="prazo_dias" name="prazo_dias" type="number" min={0} required className={input} placeholder="1" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className={label}>Frete</span>
                    <input id="frete" name="frete" className={input} placeholder="Grátis acima de R$ 300" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className={label}>Pagamento</span>
                    <input id="pagamento" name="pagamento" className={input} placeholder="Pix ou boleto 14 dias" />
                  </label>
                </div>
                <SubmitButton className={btn} pendingText="Enviando…">
                  Enviar proposta
                </SubmitButton>
              </form>
            ) : (
              <Empty title="Essa cotação já foi fechada" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

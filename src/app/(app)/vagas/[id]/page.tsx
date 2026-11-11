import Link from "next/link";
import { notFound } from "next/navigation";
import { candidatar, convidar, fecharVaga, responderCandidatura } from "@/app/actions/app";
import { AvaliarForm } from "@/components/avaliar-form";
import { SubmitButton } from "@/components/submit-button";
import {
  Avatar,
  Empty,
  MatchBadge,
  Notice,
  Pill,
  SectionTitle,
  Stars,
  TipoPill,
  btn,
  btnGhostSm,
  btnSm,
  card,
  lerAvisos,
  type SP,
} from "@/components/ui";
import { getContexto } from "@/lib/auth";
import type { Avaliacao, Candidatura, Profile, Reputacao, Vaga } from "@/lib/types";
import { calcularMatch, dataCurta, disponivelHoje, mapaReputacao } from "@/lib/utils";

export const metadata = { title: "Vaga · Chef's Match" };

type CandComPerfil = Candidatura & { profissional: Profile };

export default async function VagaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const { id } = await params;
  const { erro, msg } = await lerAvisos(searchParams);
  const { supabase, profile } = await getContexto();
  const rota = `/vagas/${id}`;

  const { data: vagaData } = await supabase
    .from("vagas")
    .select("*, empresa:profiles!vagas_empresa_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();
  if (!vagaData) notFound();
  const vaga = vagaData as Vaga & { empresa: Profile };
  const souDona = vaga.empresa_id === profile.id;

  const { data: candData } = await supabase
    .from("candidaturas")
    .select("*, profissional:profiles!candidaturas_profissional_id_fkey(*)")
    .eq("vaga_id", id)
    .order("created_at", { ascending: true });
  const cands = (candData ?? []) as CandComPerfil[];

  const { data: minhasAval } = await supabase.from("avaliacoes").select("avaliado_id, referencia_id").eq("autor_id", profile.id);
  const jaAvaliei = new Set(((minhasAval ?? []) as Pick<Avaliacao, "avaliado_id" | "referencia_id">[]).map((a) => `${a.referencia_id}:${a.avaliado_id}`));

  const ids = [vaga.empresa_id, ...cands.map((c) => c.profissional_id)];
  let sugeridos: { p: Profile; m: ReturnType<typeof calcularMatch> }[] = [];

  if (souDona && vaga.status === "aberta") {
    let q = supabase.from("profiles").select("*").eq("role", "profissional").limit(80);
    if (vaga.urgente) q = q.eq("disponivel_hoje", true);
    const { data: pros } = await q;
    const jaNaVaga = new Set(cands.map((c) => c.profissional_id));
    const lista = ((pros ?? []) as Profile[]).filter((p) => !jaNaVaga.has(p.id) && (!vaga.urgente || disponivelHoje(p)));
    ids.push(...lista.map((p) => p.id));
    const { data: repsPro } = await supabase.from("reputacao").select("*").in("perfil_id", lista.map((p) => p.id));
    const rm = mapaReputacao(repsPro as Reputacao[]);
    sugeridos = lista
      .map((p) => ({ p, m: calcularMatch(p, vaga, rm.get(p.id)) }))
      .filter((s) => s.m.motivos.includes("Mesma função"))
      .sort((a, b) => b.m.score - a.m.score)
      .slice(0, 10);
  }

  const { data: reps } = await supabase.from("reputacao").select("*").in("perfil_id", ids);
  const repMap = mapaReputacao(reps as Reputacao[]);
  const repEmpresa = repMap.get(vaga.empresa_id);
  const minha = cands.find((c) => c.profissional_id === profile.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <div>
        <Notice erro={erro} msg={msg} />
        <Link href="/vagas" className="text-sm font-semibold text-muted hover:text-paper">
          ← Vagas
        </Link>

        <div className={`${card} mt-3 grid gap-4 ${vaga.urgente ? "border-orange/60" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            {vaga.urgente && <Pill tone="bad">⚡ Para hoje</Pill>}
            <TipoPill tipo={vaga.tipo} />
            {vaga.status === "fechada" && <Pill>Encerrada</Pill>}
          </div>
          <h1 className="font-display text-5xl font-bold uppercase leading-none">{vaga.funcao}</h1>
          <Link href={`/perfil/${vaga.empresa.id}`} className="flex items-center gap-3">
            <Avatar nome={vaga.empresa.nome} size={40} />
            <span>
              <span className="block font-semibold">{vaga.empresa.nome}</span>
              <Stars media={repEmpresa?.media} total={repEmpresa?.total} />
            </span>
          </Link>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              [vaga.urgente ? "Diária" : "Remuneração", vaga.remuneracao],
              [vaga.urgente ? "Turno" : "Horário", vaga.horario ?? "A combinar"],
              ["Região", vaga.regiao ?? "Não informada"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-ink p-3">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {vaga.descricao && <p className="whitespace-pre-line text-soft">{vaga.descricao}</p>}
          <p className="text-xs text-muted">Publicada em {dataCurta(vaga.created_at)}</p>
        </div>

        {/* Profissional */}
        {profile.role === "profissional" && (
          <div className="mt-5 grid gap-4">
            {!minha && vaga.status === "aberta" && (
              <form action={candidatar}>
                <input type="hidden" name="vaga_id" value={vaga.id} />
                <SubmitButton className={`${btn} w-full sm:w-auto`} pendingText="Enviando…">
                  Quero essa vaga
                </SubmitButton>
              </form>
            )}
            {minha && (
              <div className={`${card} flex flex-wrap items-center justify-between gap-3`}>
                <p className="font-semibold">
                  {minha.origem === "convite" ? "Você foi convidado(a) para essa vaga" : "Você se candidatou"}
                </p>
                <Pill tone={minha.status === "aceita" ? "ok" : minha.status === "recusada" ? "bad" : "warn"}>
                  {minha.status === "aceita" ? "Combinado" : minha.status === "recusada" ? "Recusada" : "Aguardando"}
                </Pill>
                {minha.origem === "convite" && minha.status === "pendente" && (
                  <div className="flex w-full gap-2">
                    {(["aceita", "recusada"] as const).map((s) => (
                      <form key={s} action={responderCandidatura}>
                        <input type="hidden" name="id" value={minha.id} />
                        <input type="hidden" name="status" value={s} />
                        <input type="hidden" name="voltar" value={rota} />
                        <SubmitButton className={s === "aceita" ? btnSm : btnGhostSm} pendingText="…">
                          {s === "aceita" ? "Aceitar convite" : "Recusar"}
                        </SubmitButton>
                      </form>
                    ))}
                  </div>
                )}
              </div>
            )}
            {minha?.status === "aceita" && !jaAvaliei.has(`${minha.id}:${vaga.empresa_id}`) && (
              <AvaliarForm avaliadoId={vaga.empresa_id} avaliadoNome={vaga.empresa.nome} contexto="vaga" referenciaId={minha.id} voltar={rota} />
            )}
          </div>
        )}

        {/* Estabelecimento dono da vaga */}
        {souDona && (
          <>
            <SectionTitle>Pessoas nessa vaga</SectionTitle>
            {cands.length === 0 ? (
              <Empty title="Ninguém ainda">Convide alguém da lista ao lado ou aguarde candidaturas.</Empty>
            ) : (
              <div className="grid gap-3">
                {cands.map((c) => {
                  const m = calcularMatch(c.profissional, vaga, repMap.get(c.profissional_id));
                  const r = repMap.get(c.profissional_id);
                  return (
                    <div key={c.id} className={`${card} grid gap-3`}>
                      <div className="flex items-center gap-3">
                        <Avatar nome={c.profissional.nome} />
                        <Link href={`/perfil/${c.profissional_id}`} className="flex-1">
                          <span className="block font-semibold">{c.profissional.nome}</span>
                          <span className="text-sm text-muted">
                            {c.profissional.funcao ?? "Profissional"} · {c.origem === "convite" ? "convidado(a)" : "se candidatou"}
                          </span>
                        </Link>
                        <MatchBadge score={m.score} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Stars media={r?.media} total={r?.total} />
                        <Pill tone={c.status === "aceita" ? "ok" : c.status === "recusada" ? "bad" : "warn"}>
                          {c.status === "aceita" ? "Combinado" : c.status === "recusada" ? "Recusada" : "Pendente"}
                        </Pill>
                      </div>
                      {c.status === "pendente" && c.origem === "candidatura" && (
                        <div className="flex gap-2">
                          {(["aceita", "recusada"] as const).map((s) => (
                            <form key={s} action={responderCandidatura}>
                              <input type="hidden" name="id" value={c.id} />
                              <input type="hidden" name="status" value={s} />
                              <input type="hidden" name="voltar" value={rota} />
                              <SubmitButton className={s === "aceita" ? btnSm : btnGhostSm} pendingText="…">
                                {s === "aceita" ? "Contratar" : "Recusar"}
                              </SubmitButton>
                            </form>
                          ))}
                        </div>
                      )}
                      {c.status === "aceita" && (
                        <>
                          {c.profissional.telefone && (
                            <p className="text-sm text-soft">
                              Contato: <span className="font-mono font-semibold text-paper">{c.profissional.telefone}</span>
                            </p>
                          )}
                          {!jaAvaliei.has(`${c.id}:${c.profissional_id}`) && (
                            <AvaliarForm avaliadoId={c.profissional_id} avaliadoNome={c.profissional.nome} contexto="vaga" referenciaId={c.id} voltar={rota} />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {vaga.status === "aberta" && (
              <form action={fecharVaga} className="mt-6">
                <input type="hidden" name="id" value={vaga.id} />
                <SubmitButton className={btnGhostSm} pendingText="…">
                  Encerrar vaga
                </SubmitButton>
              </form>
            )}
          </>
        )}
      </div>

      {souDona && vaga.status === "aberta" && (
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">
              {vaga.urgente ? "Disponíveis hoje" : "Talentos compatíveis"}
            </p>
            <p className="mt-1 text-sm text-muted">Ordenados por compatibilidade. Você decide quem convidar.</p>
            <div className="mt-4 grid gap-3">
              {sugeridos.length === 0 ? (
                <p className="text-sm text-soft">
                  {vaga.urgente
                    ? "Ninguém marcou disponibilidade hoje para essa função ainda. Assim que alguém ligar, aparece aqui."
                    : "Nenhum perfil compatível ainda."}
                </p>
              ) : (
                sugeridos.map(({ p, m }) => (
                  <div key={p.id} className="grid gap-2 rounded-xl bg-ink p-3">
                    <div className="flex items-center gap-3">
                      <Avatar nome={p.nome} size={34} />
                      <Link href={`/perfil/${p.id}`} className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{p.nome}</span>
                        <span className="text-xs text-muted">
                          {p.funcao ?? "Profissional"}
                          {p.regiao && ` · ${p.regiao}`}
                        </span>
                      </Link>
                      <MatchBadge score={m.score} />
                    </div>
                    {m.motivos.length > 0 && (
                      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-soft">
                        {m.motivos.map((mo) => (
                          <span key={mo}>
                            <span className="text-ok">✓</span> {mo}
                          </span>
                        ))}
                      </p>
                    )}
                    <form action={convidar}>
                      <input type="hidden" name="vaga_id" value={vaga.id} />
                      <input type="hidden" name="profissional_id" value={p.id} />
                      <SubmitButton className={btnSm} pendingText="Enviando…">
                        Convidar{vaga.urgente ? " para hoje" : ""}
                      </SubmitButton>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

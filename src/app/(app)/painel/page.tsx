import Link from "next/link";
import { responderCandidatura } from "@/app/actions/app";
import { Disponibilidade } from "@/components/disponibilidade";
import { SubmitButton } from "@/components/submit-button";
import {
  Empty,
  MatchBadge,
  Notice,
  PageTitle,
  Pill,
  SectionTitle,
  Stat,
  Stars,
  TipoPill,
  btnGhostSm,
  btnSm,
  card,
  lerAvisos,
  type SP,
} from "@/components/ui";
import { getContexto } from "@/lib/auth";
import type { Candidatura, Cotacao, Profile, Proposta, Reputacao, Vaga } from "@/lib/types";
import { calcularMatch, dataCurta, disponivelHoje, hoje, reais } from "@/lib/utils";

export const metadata = { title: "Painel · Chef's Match" };

type CandComVaga = Candidatura & { vaga: Vaga & { empresa: Pick<Profile, "id" | "nome"> } };

export default async function Painel({ searchParams }: { searchParams: SP }) {
  const { erro, msg } = await lerAvisos(searchParams);
  const { supabase, profile } = await getContexto();
  const primeiroNome = profile.nome.split(" ")[0];

  const { data: minhaRep } = await supabase.from("reputacao").select("*").eq("perfil_id", profile.id).maybeSingle();
  const rep = minhaRep as Reputacao | null;

  /* ---------------- PROFISSIONAL ---------------- */
  if (profile.role === "profissional") {
    const [{ data: vagasData }, { data: candData }] = await Promise.all([
      supabase.from("vagas").select("*").eq("status", "aberta").order("created_at", { ascending: false }).limit(60),
      supabase
        .from("candidaturas")
        .select("*, vaga:vagas!candidaturas_vaga_id_fkey(*, empresa:profiles!vagas_empresa_id_fkey(id, nome))")
        .eq("profissional_id", profile.id)
        .order("created_at", { ascending: false }),
    ]);
    const cands = (candData ?? []) as CandComVaga[];
    const jaEstou = new Set(cands.map((c) => c.vaga_id));
    const convites = cands.filter((c) => c.origem === "convite" && c.status === "pendente");
    const minhas = cands.filter((c) => !(c.origem === "convite" && c.status === "pendente"));
    const sugestoes = ((vagasData ?? []) as Vaga[])
      .filter((v) => !jaEstou.has(v.id))
      .map((v) => ({ v, m: calcularMatch(profile, v) }))
      .sort((a, b) => b.m.score - a.m.score)
      .slice(0, 5);

    return (
      <>
        <Notice erro={erro} msg={msg} />
        <PageTitle eyebrow={profile.funcao ?? "Profissional"} title={`Olá, ${primeiroNome}!`} />
        <Disponibilidade ligado={disponivelHoje(profile)} />

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat value={sugestoes.length} label="vagas para você" />
          <Stat value={convites.length} label="convites" />
          <Stat value={rep?.total ? Number(rep.media).toFixed(1).replace(".", ",") : "–"} label="sua nota" />
        </div>

        {convites.length > 0 && (
          <>
            <SectionTitle>Convites para você</SectionTitle>
            <div className="grid gap-3">
              {convites.map((c) => (
                <div key={c.id} className={`${card} grid gap-3 border-orange/60`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">
                      {c.vaga.empresa.nome} te convidou: {c.vaga.funcao}
                    </p>
                    <TipoPill tipo={c.vaga.tipo} />
                  </div>
                  <p className="text-sm text-soft">
                    {c.vaga.remuneracao}
                    {c.vaga.horario && ` · ${c.vaga.horario}`}
                    {c.vaga.regiao && ` · ${c.vaga.regiao}`}
                    {c.vaga.urgente && " · para hoje"}
                  </p>
                  <div className="flex gap-2">
                    {(["aceita", "recusada"] as const).map((s) => (
                      <form key={s} action={responderCandidatura}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="status" value={s} />
                        <SubmitButton className={s === "aceita" ? btnSm : btnGhostSm} pendingText="…">
                          {s === "aceita" ? "Aceitar" : "Recusar"}
                        </SubmitButton>
                      </form>
                    ))}
                    <Link href={`/vagas/${c.vaga_id}`} className="self-center text-sm font-semibold text-muted hover:text-paper">
                      Ver vaga
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <SectionTitle action={<Link href="/vagas" className="text-sm font-bold text-orange">Ver todas</Link>}>
          Vagas para você
        </SectionTitle>
        {sugestoes.length === 0 ? (
          <Empty title="Nenhuma vaga aberta no momento">Ligue o “disponível hoje” para receber convites urgentes.</Empty>
        ) : (
          <div className="grid gap-3">
            {sugestoes.map(({ v, m }) => (
              <Link key={v.id} href={`/vagas/${v.id}`} className={`${card} grid gap-2 transition hover:border-muted`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{v.funcao}</p>
                  <div className="flex items-center gap-2">
                    {v.urgente && <Pill tone="bad">Hoje</Pill>}
                    <TipoPill tipo={v.tipo} />
                    <MatchBadge score={m.score} />
                  </div>
                </div>
                <p className="text-sm text-soft">
                  {v.remuneracao}
                  {v.regiao && ` · ${v.regiao}`}
                  {v.horario && ` · ${v.horario}`}
                </p>
              </Link>
            ))}
          </div>
        )}

        <SectionTitle>Minhas candidaturas</SectionTitle>
        {minhas.length === 0 ? (
          <Empty title="Você ainda não se candidatou" href="/vagas" cta="Explorar vagas" />
        ) : (
          <div className="grid gap-2">
            {minhas.map((c) => (
              <Link key={c.id} href={`/vagas/${c.vaga_id}`} className={`${card} flex items-center justify-between gap-3 py-4`}>
                <span>
                  <span className="block font-semibold">{c.vaga.funcao}</span>
                  <span className="text-sm text-muted">
                    {c.vaga.empresa.nome} · {dataCurta(c.created_at)}
                  </span>
                </span>
                <Pill tone={c.status === "aceita" ? "ok" : c.status === "recusada" ? "bad" : "warn"}>
                  {c.status === "aceita" ? "Aceita" : c.status === "recusada" ? "Recusada" : "Em análise"}
                </Pill>
              </Link>
            ))}
          </div>
        )}
      </>
    );
  }

  /* ---------------- ESTABELECIMENTO ---------------- */
  if (profile.role === "empresa") {
    const [{ data: vagasData }, { data: dispData }, { data: cotData }] = await Promise.all([
      supabase
        .from("vagas")
        .select("*, candidaturas(id, status)")
        .eq("empresa_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id").eq("role", "profissional").eq("disponivel_hoje", true).eq("disponivel_em", hoje()),
      supabase.from("cotacoes").select("*, propostas(id)").eq("empresa_id", profile.id).eq("status", "aberta"),
    ]);
    const vagas = (vagasData ?? []) as (Vaga & { candidaturas: Pick<Candidatura, "id" | "status">[] })[];
    const abertas = vagas.filter((v) => v.status === "aberta");
    const pendentes = abertas.reduce((n, v) => n + v.candidaturas.filter((c) => c.status === "pendente").length, 0);
    const cotacoes = (cotData ?? []) as (Cotacao & { propostas: { id: string }[] })[];

    return (
      <>
        <Notice erro={erro} msg={msg} />
        <PageTitle eyebrow="Estabelecimento" title={`Olá, ${primeiroNome}!`}>
          <Stars media={rep?.media} total={rep?.total} />
        </PageTitle>

        <Link
          href="/vagas/nova?urgente=1"
          className="group flex items-center justify-between gap-4 rounded-2xl bg-orange p-5 text-ink transition hover:bg-orange-hi"
        >
          <span>
            <span className="block font-display text-3xl font-bold uppercase leading-none">⚡ Preciso de alguém hoje</span>
            <span className="mt-1 block text-sm text-ink/80">
              {dispData?.length ?? 0} profissionais marcaram que estão disponíveis hoje
            </span>
          </span>
          <span className="text-3xl transition group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </Link>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat value={abertas.length} label="vagas abertas" />
          <Stat value={pendentes} label="candidatos novos" />
          <Stat value={cotacoes.length} label="cotações abertas" />
        </div>

        <SectionTitle action={<Link href="/vagas/nova" className={btnSm}>+ Nova vaga</Link>}>Minhas vagas</SectionTitle>
        {vagas.length === 0 ? (
          <Empty title="Nenhuma vaga publicada" href="/vagas/nova" cta="Publicar primeira vaga">
            Publique uma vaga fixa, temporária ou um extra para hoje.
          </Empty>
        ) : (
          <div className="grid gap-2">
            {vagas.slice(0, 8).map((v) => {
              const novos = v.candidaturas.filter((c) => c.status === "pendente").length;
              return (
                <Link key={v.id} href={`/vagas/${v.id}`} className={`${card} flex items-center justify-between gap-3 py-4 transition hover:border-muted`}>
                  <span>
                    <span className="flex items-center gap-2 font-semibold">
                      {v.funcao} {v.urgente && <Pill tone="bad">Hoje</Pill>}
                    </span>
                    <span className="text-sm text-muted">
                      {v.remuneracao} · {v.candidaturas.length} pessoa{v.candidaturas.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  {v.status === "fechada" ? <Pill>Encerrada</Pill> : novos > 0 ? <Pill tone="orange">{novos} novo{novos > 1 ? "s" : ""}</Pill> : <TipoPill tipo={v.tipo} />}
                </Link>
              );
            })}
          </div>
        )}

        <SectionTitle action={<Link href="/cotacoes" className="text-sm font-bold text-orange">Nova cotação</Link>}>
          Compras em andamento
        </SectionTitle>
        {cotacoes.length === 0 ? (
          <Empty title="Nenhuma cotação aberta" href="/cotacoes" cta="Pedir cotação">
            Liste os insumos da semana e receba propostas de fornecedores.
          </Empty>
        ) : (
          <div className="grid gap-2">
            {cotacoes.map((c) => (
              <Link key={c.id} href={`/cotacoes/${c.id}`} className={`${card} flex items-center justify-between py-4`}>
                <span className="font-semibold">{c.titulo}</span>
                <Pill tone={c.propostas.length ? "orange" : "neutral"}>
                  {c.propostas.length} proposta{c.propostas.length === 1 ? "" : "s"}
                </Pill>
              </Link>
            ))}
          </div>
        )}
      </>
    );
  }

  /* ---------------- FORNECEDOR ---------------- */
  const [{ data: cotData }, { data: propData }] = await Promise.all([
    supabase.from("cotacoes").select("*, empresa:profiles!cotacoes_empresa_id_fkey(nome, regiao)").eq("status", "aberta").order("created_at", { ascending: false }).limit(30),
    supabase.from("propostas").select("*").eq("fornecedor_id", profile.id),
  ]);
  const propostas = (propData ?? []) as Proposta[];
  const respondidas = new Set(propostas.map((p) => p.cotacao_id));
  const abertas = ((cotData ?? []) as (Cotacao & { empresa: Pick<Profile, "nome" | "regiao"> })[]).filter((c) => !respondidas.has(c.id));
  const aceitas = propostas.filter((p) => p.aceita);
  const faturado = aceitas.reduce((s, p) => s + Number(p.preco_total), 0);

  return (
    <>
      <Notice erro={erro} msg={msg} />
      <PageTitle eyebrow="Fornecedor" title={`Olá, ${primeiroNome}!`}>
        <Stars media={rep?.media} total={rep?.total} />
      </PageTitle>
      <div className="grid grid-cols-3 gap-3">
        <Stat value={abertas.length} label="cotações esperando" />
        <Stat value={propostas.length} label="propostas enviadas" />
        <Stat value={aceitas.length} label="pedidos ganhos" />
      </div>
      {faturado > 0 && <p className="mt-3 text-sm text-muted">Total em pedidos aprovados: {reais(faturado)}</p>}

      <SectionTitle>Restaurantes pedindo cotação</SectionTitle>
      {abertas.length === 0 ? (
        <Empty title="Nenhuma cotação nova agora" href="/produtos" cta="Completar meu catálogo">
          Quando um restaurante pedir cotação, ela aparece aqui.
        </Empty>
      ) : (
        <div className="grid gap-3">
          {abertas.map((c) => (
            <Link key={c.id} href={`/cotacoes/${c.id}`} className={`${card} grid gap-1 transition hover:border-muted`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{c.titulo}</p>
                {c.categoria && <Pill>{c.categoria}</Pill>}
              </div>
              <p className="text-sm text-muted">
                {c.empresa.nome}
                {c.empresa.regiao && ` · ${c.empresa.regiao}`} · {dataCurta(c.created_at)}
              </p>
              <p className="mt-1 text-sm font-bold text-orange">Enviar proposta →</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

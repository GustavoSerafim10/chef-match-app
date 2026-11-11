import Link from "next/link";
import { Empty, MatchBadge, Notice, PageTitle, Pill, Stars, TipoPill, btnSm, card, lerAvisos, type SP } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { FUNCOES } from "@/lib/constants";
import type { Profile, Reputacao, Vaga } from "@/lib/types";
import { calcularMatch, mapaReputacao } from "@/lib/utils";

export const metadata = { title: "Vagas · Chef's Match" };

export default async function Vagas({ searchParams }: { searchParams: SP }) {
  const { erro, msg, sp } = await lerAvisos(searchParams);
  const { supabase, profile } = await getContexto();

  if (profile.role === "empresa") {
    const { data } = await supabase
      .from("vagas")
      .select("*, candidaturas(id)")
      .eq("empresa_id", profile.id)
      .order("created_at", { ascending: false });
    const vagas = (data ?? []) as (Vaga & { candidaturas: { id: string }[] })[];
    return (
      <>
        <Notice erro={erro} msg={msg} />
        <PageTitle eyebrow="Talentos" title="Minhas vagas" />
        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/vagas/nova?urgente=1" className={btnSm}>
            ⚡ Preciso de alguém hoje
          </Link>
          <Link href="/vagas/nova" className="inline-flex items-center rounded-full border-2 border-line px-4 py-2 text-sm font-bold">
            + Vaga fixa ou temporária
          </Link>
        </div>
        {vagas.length === 0 ? (
          <Empty title="Nenhuma vaga ainda">Publique sua primeira vaga em menos de um minuto.</Empty>
        ) : (
          <div className="grid gap-2">
            {vagas.map((v) => (
              <Link key={v.id} href={`/vagas/${v.id}`} className={`${card} flex items-center justify-between gap-3 py-4 hover:border-muted`}>
                <span>
                  <span className="flex items-center gap-2 font-semibold">
                    {v.funcao} {v.urgente && <Pill tone="bad">Hoje</Pill>}
                  </span>
                  <span className="text-sm text-muted">
                    {v.remuneracao} · {v.candidaturas.length} pessoa{v.candidaturas.length === 1 ? "" : "s"}
                  </span>
                </span>
                {v.status === "fechada" ? <Pill>Encerrada</Pill> : <TipoPill tipo={v.tipo} />}
              </Link>
            ))}
          </div>
        )}
      </>
    );
  }

  const filtro = typeof sp.funcao === "string" ? sp.funcao : "";
  let q = supabase
    .from("vagas")
    .select("*, empresa:profiles!vagas_empresa_id_fkey(id, nome)")
    .eq("status", "aberta")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filtro) q = q.eq("funcao", filtro);
  const { data } = await q;
  const vagas = (data ?? []) as (Vaga & { empresa: Pick<Profile, "id" | "nome"> })[];
  const { data: reps } = await supabase.from("reputacao").select("*").in("perfil_id", [...new Set(vagas.map((v) => v.empresa_id))]);
  const repMap = mapaReputacao(reps as Reputacao[]);
  const lista = vagas
    .map((v) => ({ v, m: calcularMatch(profile, v) }))
    .sort((a, b) => Number(b.v.urgente) - Number(a.v.urgente) || b.m.score - a.m.score);

  return (
    <>
      <Notice erro={erro} msg={msg} />
      <PageTitle eyebrow="Vagas perto de você" title="Oportunidades">
        Ordenadas por compatibilidade com o seu perfil. Vagas para hoje aparecem primeiro.
      </PageTitle>
      <nav aria-label="Filtrar por função" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href="/vagas" className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${!filtro ? "bg-orange text-ink" : "bg-ink-3 text-soft"}`}>
          Todas
        </Link>
        {FUNCOES.map((f) => (
          <Link
            key={f}
            href={`/vagas?funcao=${encodeURIComponent(f)}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${filtro === f ? "bg-orange text-ink" : "bg-ink-3 text-soft"}`}
          >
            {f}
          </Link>
        ))}
      </nav>
      {lista.length === 0 ? (
        <Empty title="Nenhuma vaga com esse filtro">Tente outra função ou volte mais tarde.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lista.map(({ v, m }) => {
            const r = repMap.get(v.empresa_id);
            return (
              <Link key={v.id} href={`/vagas/${v.id}`} className={`${card} grid gap-2 hover:border-muted`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{v.funcao}</p>
                    <p className="text-sm text-muted">{v.empresa.nome}</p>
                  </div>
                  <MatchBadge score={m.score} />
                </div>
                <p className="text-sm text-soft">
                  {v.remuneracao}
                  {v.regiao && ` · ${v.regiao}`}
                  {v.horario && ` · ${v.horario}`}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {v.urgente && <Pill tone="bad">Para hoje</Pill>}
                  <TipoPill tipo={v.tipo} />
                  <Stars media={r?.media} total={r?.total} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

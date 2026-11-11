import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Empty, Pill, SectionTitle, card } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";
import type { Avaliacao, Profile, Reputacao } from "@/lib/types";
import { dataCurta, disponivelHoje } from "@/lib/utils";

export const metadata = { title: "Perfil · Chef's Match" };

function nivel(rep: Reputacao | null) {
  const total = rep?.total ?? 0;
  const media = Number(rep?.media ?? 0);
  if (total === 0) return { t: "Perfil em construção", tone: "neutral" as const };
  if (total >= 10 && media >= 4.5) return { t: "Destaque de qualidade", tone: "orange" as const };
  if (total >= 5) return { t: "Histórico consistente", tone: "ok" as const };
  return { t: "Avaliações verificadas", tone: "ok" as const };
}

export default async function PerfilPublico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile: eu } = await getContexto();

  const { data: pData } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!pData) notFound();
  const p = pData as Profile;

  const [{ data: repData }, { data: avData }] = await Promise.all([
    supabase.from("reputacao").select("*").eq("perfil_id", id).maybeSingle(),
    supabase
      .from("avaliacoes")
      .select("*, autor:profiles!avaliacoes_autor_id_fkey(nome, role)")
      .eq("avaliado_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  const rep = repData as Reputacao | null;
  const avaliacoes = (avData ?? []) as (Avaliacao & { autor: Pick<Profile, "nome" | "role"> })[];
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, q: avaliacoes.filter((a) => a.nota === n).length }));
  const nv = nivel(rep);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
      <div className={`${card} grid justify-items-start gap-4`}>
        <Avatar nome={p.nome} size={72} />
        <div>
          <h1 className="font-display text-4xl font-bold uppercase leading-none">{p.nome}</h1>
          <p className="mt-1 text-soft">
            {p.role === "profissional" ? p.funcao ?? "Profissional" : ROLE_LABEL[p.role]}
            {p.regiao && ` · ${p.regiao}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone={nv.tone}>{nv.t}</Pill>
          {p.role === "profissional" && disponivelHoje(p) && <Pill tone="orange">⚡ Disponível hoje</Pill>}
          {p.role === "profissional" && (p.experiencia_anos ?? 0) > 0 && <Pill>{p.experiencia_anos} anos de experiência</Pill>}
        </div>
        {p.bio && <p className="whitespace-pre-line text-sm text-soft">{p.bio}</p>}
        {(p.especialidades ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.especialidades!.map((e) => (
              <span key={e} className="rounded-full border border-line px-2.5 py-1 text-xs text-soft">
                {e}
              </span>
            ))}
          </div>
        )}
        {eu.id === p.id && (
          <Link href="/perfil" className="text-sm font-bold text-orange">
            Editar meu perfil →
          </Link>
        )}
      </div>

      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">Chef&apos;s Match Qualidade</p>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <p className="font-display text-7xl font-bold leading-none text-orange">
            {rep?.total ? Number(rep.media).toFixed(1).replace(".", ",") : "–"}
          </p>
          <div className="grid gap-1.5">
            {dist.map(({ n, q }) => (
              <div key={n} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-3 text-right">{n}</span>
                <span className="h-1.5 w-40 overflow-hidden rounded-full bg-ink-3">
                  <span
                    className="block h-full rounded-full bg-orange"
                    style={{ width: `${avaliacoes.length ? (q / avaliacoes.length) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-4">{q}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          {rep?.total ?? 0} avaliação(ões) verificada(s). Só avalia quem teve uma experiência confirmada no app.
        </p>

        <SectionTitle>O que dizem</SectionTitle>
        {avaliacoes.length === 0 ? (
          <Empty title="Ainda sem avaliações">As avaliações aparecem depois de vagas e pedidos concluídos.</Empty>
        ) : (
          <div className="grid gap-3">
            {avaliacoes.map((a) => (
              <div key={a.id} className={`${card} grid gap-1.5`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-orange" aria-label={`${a.nota} de 5 estrelas`}>
                    {"★".repeat(a.nota)}
                    <span className="text-line">{"★".repeat(5 - a.nota)}</span>
                  </span>
                  <span className="text-xs text-muted">{dataCurta(a.created_at)}</span>
                </div>
                {a.comentario && <p className="text-soft">{a.comentario}</p>}
                <p className="text-xs text-muted">
                  {a.autor.nome} · {ROLE_LABEL[a.autor.role]} · {a.contexto === "vaga" ? "contratação" : "pedido"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

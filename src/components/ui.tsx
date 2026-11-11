import Link from "next/link";
import type { ReactNode } from "react";
import type { TipoVaga } from "@/lib/types";
import { TIPO_LABEL } from "@/lib/constants";
import { iniciais } from "@/lib/utils";

export const btn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-orange px-5 py-3 font-bold text-ink transition hover:bg-orange-hi disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
export const btnSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-bold text-ink transition hover:bg-orange-hi disabled:opacity-50 cursor-pointer";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-line px-5 py-3 font-bold text-paper transition hover:border-muted cursor-pointer";
export const btnGhostSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-line px-4 py-2 text-sm font-bold text-paper transition hover:border-muted cursor-pointer";
export const card = "rounded-2xl border border-line bg-ink-2 p-5";
export const input =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-paper placeholder:text-muted/70 focus:border-orange focus:outline-none";
export const label = "text-xs font-bold uppercase tracking-wider text-muted";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide ${className}`}>
      <img src="/icon.svg" alt="" width={28} height={28} />
      <span>
        Chef&apos;s <span className="text-orange">Match</span>
      </span>
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-orange">{children}</p>;
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 grid gap-2">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="font-display text-4xl font-bold uppercase leading-none sm:text-5xl">{title}</h1>
      {children && <p className="max-w-prose text-soft">{children}</p>}
    </div>
  );
}

const tipoCor: Record<TipoVaga, string> = {
  efetivo: "bg-ok/15 text-ok",
  temporario: "bg-warn/15 text-warn",
  extra: "bg-bad/15 text-bad",
};

export function TipoPill({ tipo }: { tipo: TipoVaga }) {
  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase ${tipoCor[tipo]}`}>
      {TIPO_LABEL[tipo]}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "orange" | "ok" | "warn" | "bad" }) {
  const cores = {
    neutral: "bg-ink-3 text-soft",
    orange: "bg-orange/15 text-orange",
    ok: "bg-ok/15 text-ok",
    warn: "bg-warn/15 text-warn",
    bad: "bg-bad/15 text-bad",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase ${cores[tone]}`}>
      {children}
    </span>
  );
}

const avatarCores = ["#C2531A", "#23945F", "#3B5BA9", "#8A4FB0", "#B0802A"];

export function Avatar({ nome, size = 40 }: { nome: string; size?: number }) {
  const cor = avatarCores[(nome.charCodeAt(0) || 0) % avatarCores.length];
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: cor, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}

export function Stars({ media, total }: { media?: number | null; total?: number | null }) {
  if (!total) return <span className="text-sm text-muted">Sem avaliações ainda</span>;
  return (
    <span className="text-sm text-soft">
      <span className="text-orange">★</span> {Number(media).toFixed(1).replace(".", ",")}{" "}
      <span className="text-muted">({total} {total === 1 ? "avaliação" : "avaliações"})</span>
    </span>
  );
}

export function MatchBadge({ score }: { score: number }) {
  return (
    <span className="rounded-lg bg-ink px-2 py-1 font-mono text-sm font-semibold text-orange ring-1 ring-line">{score}%</span>
  );
}

export function Notice({ erro, msg }: { erro?: string; msg?: string }) {
  if (!erro && !msg) return null;
  return (
    <div
      role="status"
      className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${erro ? "bg-bad/15 text-bad" : "bg-ok/15 text-ok"}`}
    >
      {erro ?? msg}
    </div>
  );
}

export function Empty({ title, children, href, cta }: { title: string; children?: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="grid justify-items-start gap-2 rounded-2xl border border-dashed border-line p-6">
      <p className="font-bold">{title}</p>
      {children && <p className="text-sm text-muted">{children}</p>}
      {href && cta && (
        <Link href={href} className={`${btnSm} mt-2`}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export function Stat({ value, label: rotulo }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-2 p-4">
      <p className="font-display text-4xl font-bold leading-none text-orange">{value}</p>
      <p className="mt-1.5 text-sm text-muted">{rotulo}</p>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-bold uppercase">{children}</h2>
      {action}
    </div>
  );
}

export type SP = Promise<Record<string, string | string[] | undefined>>;

export async function lerAvisos(searchParams: SP) {
  const sp = await searchParams;
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return { erro: um(sp.erro), msg: um(sp.msg), sp };
}

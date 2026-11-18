import Link from "next/link";
import type { ReactNode } from "react";
import type { TipoVaga } from "@/lib/types";
import { TIPO_LABEL } from "@/lib/constants";
import { iniciais } from "@/lib/utils";
import { corDoMatch } from "@/lib/visual";
import { Contador } from "./contador";

export const btn =
  "brilho inline-flex items-center justify-center gap-2 rounded-full bg-orange px-5 py-3 font-bold text-ink transition hover:bg-orange-hi disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
export const btnSm =
  "brilho inline-flex items-center justify-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-bold text-ink transition hover:bg-orange-hi disabled:opacity-50 cursor-pointer";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 bg-ink/40 px-5 py-3 font-bold text-paper backdrop-blur transition hover:border-orange hover:shadow-[0_0_18px_-4px_rgb(255_107_44/.6)] cursor-pointer";
export const btnGhostSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-white/25 bg-ink/40 px-4 py-2 text-sm font-bold text-paper backdrop-blur transition hover:border-orange cursor-pointer";
export const card = "vidro rounded-2xl p-5";
export const input =
  "w-full rounded-xl border border-white/10 bg-[rgb(24_22_20/.72)] px-4 py-3 text-paper backdrop-blur placeholder:text-muted/70 transition focus:border-orange focus:shadow-[0_0_0_3px_rgb(255_107_44/.2)] focus:outline-none";
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
    <span className={`selo-aceso rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase ${tipoCor[tipo]}`}>
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
    <span className={`${tone === "neutral" ? "" : "selo-aceso "}inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase ${cores[tone]}`}>
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

/** Anel de compatibilidade: o arco cresce até a porcentagem, verde a partir de 70%. */
export function MatchBadge({ score, size = 48 }: { score: number; size?: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const cor = corDoMatch(score);
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} title={`${score}% de compatibilidade`}>
      <svg viewBox="0 0 48 48" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="rgb(14 13 12 / .6)" stroke="rgb(255 255 255 / .1)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="anel-match"
          style={{ filter: `drop-shadow(0 0 4px ${cor})`, ["--anel" as string]: c }}
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-bold" style={{ color: cor }}>
        {score}%
      </span>
    </span>
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

export function Stat({ value, label: rotulo }: { value: string | number; label: string }) {
  return (
    <div className="vidro relative overflow-hidden rounded-2xl p-4">
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange/70 to-transparent" />
      <p className="font-display text-4xl font-bold leading-none text-orange [text-shadow:0_0_18px_rgb(255_107_44/.55)]">
        <span className="sr-only">{value}</span>
        <span aria-hidden="true">
          <Contador valor={value} />
        </span>
      </p>
      <p className="mt-1.5 text-sm text-soft">{rotulo}</p>
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

/** Pílulas de filtro: a selecionada brilha em laranja. */
export const filtroAtivo = "bg-orange text-ink shadow-[0_0_15px_rgb(255_107_44/.45)]";
export const filtroInativo = "border border-white/10 bg-[rgb(24_22_20/.72)] text-soft backdrop-blur hover:border-orange/50 hover:text-paper";

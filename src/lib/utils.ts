import type { Profile, Reputacao, Vaga } from "./types";

/** Data de hoje em Brasília, no formato YYYY-MM-DD. */
export function hoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function disponivelHoje(p: Pick<Profile, "disponivel_hoje" | "disponivel_em">): boolean {
  return p.disponivel_hoje && p.disponivel_em === hoje();
}

export function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function reais(valor: number | null | undefined): string {
  if (valor == null) return "a combinar";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function texto(fd: FormData, campo: string): string {
  return String(fd.get(campo) ?? "").trim();
}

export function mapaReputacao(lista: Reputacao[] | null): Map<string, Reputacao> {
  return new Map((lista ?? []).map((r) => [r.perfil_id, r]));
}

const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\(a\)/g, "").trim();

/**
 * Compatibilidade entre um profissional e uma vaga (0 a 99), com os motivos.
 * A IA recomenda; quem decide é sempre o estabelecimento.
 */
export function calcularMatch(p: Profile, v: Vaga, rep?: Reputacao) {
  let score = 0;
  const motivos: string[] = [];

  if (p.funcao && normalizar(p.funcao) === normalizar(v.funcao)) {
    score += 45;
    motivos.push("Mesma função");
  }
  if (p.regiao && v.regiao && p.regiao === v.regiao) {
    score += 20;
    motivos.push(`Mora em ${v.regiao}`);
  } else if (p.regiao) {
    score += 6;
  }
  const disp = disponivelHoje(p);
  if (v.urgente) {
    if (disp) {
      score += 20;
      motivos.push("Disponível hoje");
    }
  } else {
    score += 12;
  }
  const exp = Math.min(p.experiencia_anos ?? 0, 5);
  score += exp * 2;
  if (exp > 0) motivos.push(`${p.experiencia_anos} ano${p.experiencia_anos === 1 ? "" : "s"} de experiência`);
  if (rep && rep.total > 0) {
    score += Math.round((Number(rep.media) / 5) * 5);
    motivos.push(`★ ${Number(rep.media).toFixed(1).replace(".", ",")} (${rep.total})`);
  }
  return { score: Math.min(99, score), motivos };
}

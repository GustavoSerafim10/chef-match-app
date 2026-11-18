/** Partes de um texto numérico em pt-BR ("R$ 2.300", "4,5", "3") para animar a contagem. */
export type Numero = { antes: string; alvo: number; casas: number; milhar: boolean; depois: string };

export function lerNumero(texto: string): Numero | null {
  const m = texto.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!m || !/\d/.test(m[2])) return null;
  const bruto = m[2];
  const casas = bruto.includes(",") ? bruto.split(",")[1].length : 0;
  return {
    antes: m[1],
    alvo: parseFloat(bruto.replace(/\./g, "").replace(",", ".")),
    casas,
    milhar: bruto.includes("."),
    depois: m[3],
  };
}

export function formatarComo(n: Numero, valor: number): string {
  const corpo = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: n.casas,
    maximumFractionDigits: n.casas,
    useGrouping: n.milhar,
  });
  return n.antes + corpo + n.depois;
}

/** Cor do anel de compatibilidade: verde a partir de 70%, laranja de 40% a 69%, cinza abaixo. */
export function corDoMatch(score: number): string {
  if (score >= 70) return "#3fb37f";
  if (score >= 40) return "#ff8a45";
  return "#a79d94";
}

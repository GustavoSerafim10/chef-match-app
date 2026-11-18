import { describe, expect, it } from "vitest";
import { corDoMatch, formatarComo, lerNumero } from "./visual";

describe("lerNumero", () => {
  it("lê inteiros, decimais com vírgula e milhar com ponto", () => {
    expect(lerNumero("3")).toEqual({ antes: "", alvo: 3, casas: 0, milhar: false, depois: "" });
    expect(lerNumero("4,5")).toEqual({ antes: "", alvo: 4.5, casas: 1, milhar: false, depois: "" });
    expect(lerNumero("R$ 2.300")).toEqual({ antes: "R$ ", alvo: 2300, casas: 0, milhar: true, depois: "" });
  });
  it("devolve null quando não há número", () => {
    expect(lerNumero("–")).toBeNull();
    expect(lerNumero("")).toBeNull();
  });
});

describe("formatarComo", () => {
  it("termina exatamente no texto original", () => {
    for (const t of ["3", "4,5", "R$ 2.300", "12"]) {
      const n = lerNumero(t)!;
      expect(formatarComo(n, n.alvo)).toBe(t);
    }
  });
  it("formata valores intermediários no mesmo padrão", () => {
    expect(formatarComo(lerNumero("4,5")!, 0)).toBe("0,0");
    expect(formatarComo(lerNumero("R$ 2.300")!, 1150)).toBe("R$ 1.150");
  });
});

describe("corDoMatch", () => {
  it("verde a partir de 70, laranja de 40 a 69, cinza abaixo", () => {
    expect(corDoMatch(99)).toBe("#3fb37f");
    expect(corDoMatch(70)).toBe("#3fb37f");
    expect(corDoMatch(69)).toBe("#ff8a45");
    expect(corDoMatch(40)).toBe("#ff8a45");
    expect(corDoMatch(39)).toBe("#a79d94");
  });
});

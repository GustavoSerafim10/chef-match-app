import { describe, expect, it } from "vitest";
import { validarEntrada, type Mensagem } from "./entrada";
import { criarLimitador } from "./limite";
import { extrairTexto, montarCorpoGemini, perguntarAoGemini } from "./gemini";

const u = (texto: string): Mensagem => ({ papel: "usuario", texto });
const a = (texto: string): Mensagem => ({ papel: "assistente", texto });

describe("validarEntrada", () => {
  it.each([
    ["null", null],
    ["objeto vazio", {}],
    ["sem mensagens", { mensagens: [] }],
    ["última do assistente", { mensagens: [u("oi"), a("olá")] }],
    ["só espaços", { mensagens: [u("   ")] }],
    ["501 caracteres", { mensagens: [u("x".repeat(501))] }],
    ["papel inválido", { mensagens: [{ papel: "sistema", texto: "oi" }] }],
  ])("recusa %s", (_nome, corpo) => {
    const r = validarEntrada(corpo);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro.length).toBeGreaterThan(0);
  });

  it("aceita 500 caracteres e mantém só as 6 últimas mensagens", () => {
    const msgs = [u("1"), a("2"), u("3"), a("4"), u("5"), a("6"), u("7"), a("8"), u("x".repeat(500))];
    const r = validarEntrada({ mensagens: msgs });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.mensagens).toHaveLength(6);
      expect(r.mensagens[0].texto).toBe("4");
      expect(r.mensagens[5].texto).toBe("x".repeat(500));
      expect(r.cliente).toBe("");
    }
  });

  it("repassa o cliente (cortado em 64 caracteres)", () => {
    const r = validarEntrada({ mensagens: [u("oi")], cliente: "c".repeat(100) });
    expect(r.ok && r.cliente).toBe("c".repeat(64));
  });
});

describe("criarLimitador", () => {
  it("bloqueia depois do máximo e libera quando a janela passa", () => {
    let agora = 0;
    const pode = criarLimitador(2, 1000, () => agora);
    expect([pode("a"), pode("a"), pode("a")]).toEqual([true, true, false]);
    expect(pode("b")).toBe(true);
    agora = 1001;
    expect(pode("a")).toBe(true);
  });
});

describe("montarCorpoGemini", () => {
  it("monta instruções, papéis e limite de tokens", () => {
    const corpo = montarCorpoGemini("X", [u("oi"), a("olá")]) as {
      systemInstruction: { parts: { text: string }[] };
      contents: { role: string; parts: { text: string }[] }[];
      generationConfig: { maxOutputTokens: number };
    };
    expect(corpo.systemInstruction.parts[0].text).toBe("X");
    expect(corpo.contents.map((c) => c.role)).toEqual(["user", "model"]);
    expect(corpo.contents[1].parts[0].text).toBe("olá");
    expect(corpo.generationConfig.maxOutputTokens).toBe(500);
  });
});

describe("extrairTexto", () => {
  it("junta as partes do primeiro candidato", () => {
    expect(extrairTexto({ candidates: [{ content: { parts: [{ text: "a" }, { text: "b" }] } }] })).toBe("ab");
  });
  it("devolve null sem texto", () => {
    expect(extrairTexto({})).toBeNull();
    expect(extrairTexto(null)).toBeNull();
    expect(extrairTexto({ candidates: [{ content: { parts: [] } }] })).toBeNull();
  });
});

describe("perguntarAoGemini", () => {
  const resposta = (status: number, corpo: unknown) =>
    new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

  it("chama a URL do modelo com a chave no header e devolve o texto", async () => {
    let url = "";
    let chave: string | null = null;
    const fetchFalso = (async (u: string, init: RequestInit) => {
      url = u;
      chave = new Headers(init.headers).get("x-goog-api-key");
      return resposta(200, { candidates: [{ content: { parts: [{ text: "Oi!" }] } }] });
    }) as unknown as typeof fetch;

    const texto = await perguntarAoGemini("X", [u("oi")], { chave: "k1", modelo: "m1", fetch: fetchFalso });
    expect(texto).toBe("Oi!");
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/m1:generateContent");
    expect(chave).toBe("k1");
  });

  it("rejeita quando o Gemini responde 429", async () => {
    const fetchFalso = (async () => resposta(429, { error: "quota" })) as unknown as typeof fetch;
    await expect(perguntarAoGemini("X", [u("oi")], { chave: "k", modelo: "m", fetch: fetchFalso })).rejects.toThrow();
  });

  it("rejeita quando a resposta vem sem texto", async () => {
    const fetchFalso = (async () => resposta(200, { candidates: [] })) as unknown as typeof fetch;
    await expect(perguntarAoGemini("X", [u("oi")], { chave: "k", modelo: "m", fetch: fetchFalso })).rejects.toThrow();
  });
});

import { INSTRUCOES, FRASE_SEM_RESPOSTA } from "./instrucoes";

describe("INSTRUCOES", () => {
  it("traz as regras, a frase de fallback e o conhecimento do projeto", () => {
    expect(FRASE_SEM_RESPOSTA).toBe("Boa pergunta pra fazer à Rayanne e ao grupo no final! 😉");
    expect(INSTRUCOES).toContain("Chef's Match");
    expect(INSTRUCOES).toContain(FRASE_SEM_RESPOSTA);
    expect(INSTRUCOES).toContain("Brasília");
    expect(INSTRUCOES).toContain("chef-match-app.vercel.app");
    expect(INSTRUCOES).not.toMatch(/<section|<div|{\s*margin/);
    expect(INSTRUCOES.length).toBeLessThan(60000);
  });
});

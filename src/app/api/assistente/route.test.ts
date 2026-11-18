import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Rota = typeof import("./route");
let rota: Rota;
let chamadas: string[];

const okGemini = () =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Resposta da IA" }] } }] }), {
    status: 200,
  });

function pedido(corpo: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/assistente", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}
const pergunta = (cliente = "c1") => ({ mensagens: [{ papel: "usuario", texto: "Como ganha dinheiro?" }], cliente });

function usarFetch(resposta: (url: string) => Response) {
  vi.stubGlobal("fetch", async (url: string) => {
    chamadas.push(url);
    return resposta(url);
  });
}

beforeEach(async () => {
  vi.resetModules();
  chamadas = [];
  vi.stubEnv("GEMINI_API_KEY", "chave-teste");
  vi.stubEnv("GEMINI_MODELOS", "");
  rota = await import("./route");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/assistente", () => {
  it("devolve 400 para corpo que não é JSON, sem chamar o Gemini", async () => {
    usarFetch(okGemini);
    const res = await rota.POST(pedido("não é json"));
    expect(res.status).toBe(400);
    expect(chamadas).toHaveLength(0);
  });

  it("devolve 400 para pergunta vazia", async () => {
    usarFetch(okGemini);
    const res = await rota.POST(pedido({ mensagens: [{ papel: "usuario", texto: " " }] }));
    expect(res.status).toBe(400);
    expect((await res.json()).erro).toBeTruthy();
  });

  it("devolve 503 indisponivel sem a chave", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    usarFetch(okGemini);
    const res = await rota.POST(pedido(pergunta()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ erro: "indisponivel" });
  });

  it("devolve a resposta da IA com CORS aberto, usando o Flash-Lite primeiro", async () => {
    usarFetch(okGemini);
    const res = await rota.POST(pedido(pergunta()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ resposta: "Resposta da IA" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(chamadas[0]).toContain("/models/gemini-flash-lite-latest:generateContent");
  });

  it("tenta o próximo modelo quando o primeiro recusa", async () => {
    usarFetch((url) => (url.includes("lite") ? new Response("{}", { status: 429 }) : okGemini()));
    const res = await rota.POST(pedido(pergunta()));
    expect(res.status).toBe(200);
    expect(chamadas).toHaveLength(2);
    expect(chamadas[1]).toContain("/models/gemini-flash-latest:");
  });

  it("respeita GEMINI_MODELOS", async () => {
    vi.stubEnv("GEMINI_MODELOS", "modelo-x, modelo-y");
    usarFetch(okGemini);
    await rota.POST(pedido(pergunta()));
    expect(chamadas[0]).toContain("/models/modelo-x:");
  });

  it("devolve 503 quando todos os modelos falham", async () => {
    usarFetch(() => new Response("{}", { status: 429 }));
    const res = await rota.POST(pedido(pergunta()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ erro: "indisponivel" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("limita 15 perguntas por hora por IP + cliente", async () => {
    usarFetch(okGemini);
    for (let i = 0; i < 15; i++) expect((await rota.POST(pedido(pergunta("c1")))).status).toBe(200);
    const bloqueada = await rota.POST(pedido(pergunta("c1")));
    expect(bloqueada.status).toBe(429);
    expect(await bloqueada.json()).toEqual({ erro: "limite" });
    expect((await rota.POST(pedido(pergunta("c2")))).status).toBe(200);
  });
});

describe("OPTIONS /api/assistente", () => {
  it("responde 204 com os headers de CORS", async () => {
    const res = rota.OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
  });
});

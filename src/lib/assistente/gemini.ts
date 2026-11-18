import type { Mensagem } from "./entrada";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function montarCorpoGemini(instrucoes: string, mensagens: Mensagem[]) {
  return {
    systemInstruction: { parts: [{ text: instrucoes }] },
    contents: mensagens.map((m) => ({
      role: m.papel === "usuario" ? "user" : "model",
      parts: [{ text: m.texto }],
    })),
    generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
  };
}

export function extrairTexto(resposta: unknown): string | null {
  const partes = (resposta as { candidates?: { content?: { parts?: { text?: unknown }[] } }[] } | null)
    ?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(partes)) return null;
  const texto = partes.map((p) => (typeof p?.text === "string" ? p.text : "")).join("").trim();
  return texto || null;
}

export async function perguntarAoGemini(
  instrucoes: string,
  mensagens: Mensagem[],
  opcoes: { chave: string; modelo: string; fetch?: typeof fetch },
): Promise<string> {
  const f = opcoes.fetch ?? fetch;
  const res = await f(`${BASE}/${opcoes.modelo}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": opcoes.chave },
    body: JSON.stringify(montarCorpoGemini(instrucoes, mensagens)),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Gemini respondeu ${res.status}`);
  const texto = extrairTexto(await res.json());
  if (!texto) throw new Error("Gemini respondeu sem texto");
  return texto;
}

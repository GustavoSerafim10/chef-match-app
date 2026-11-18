import { validarEntrada } from "@/lib/assistente/entrada";
import { perguntarAoGemini } from "@/lib/assistente/gemini";
import { INSTRUCOES } from "@/lib/assistente/instrucoes";
import { criarLimitador } from "@/lib/assistente/limite";

export const runtime = "nodejs";

// Flash-Lite primeiro: no plano grátis ele tem bem mais cota por dia que o Flash.
const MODELOS_PADRAO = ["gemini-flash-lite-latest", "gemini-flash-latest"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const podePerguntar = criarLimitador(15, 60 * 60 * 1000);

const json = (corpo: unknown, status: number) => Response.json(corpo, { status, headers: CORS });

function modelos(): string[] {
  const lista = (process.env.GEMINI_MODELOS ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return lista.length ? lista : MODELOS_PADRAO;
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return json({ erro: "Envie uma pergunta." }, 400);
  }

  const entrada = validarEntrada(corpo);
  if (!entrada.ok) return json({ erro: entrada.erro }, 400);

  const chave = process.env.GEMINI_API_KEY;
  if (!chave) return json({ erro: "indisponivel" }, 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "sem-ip";
  if (!podePerguntar(`${ip}|${entrada.cliente}`)) return json({ erro: "limite" }, 429);

  for (const modelo of modelos()) {
    try {
      const resposta = await perguntarAoGemini(INSTRUCOES, entrada.mensagens, { chave, modelo });
      return json({ resposta }, 200);
    } catch (erro) {
      console.error(`[assistente] ${modelo} falhou:`, erro instanceof Error ? erro.message : erro);
    }
  }
  return json({ erro: "indisponivel" }, 503);
}

export type Mensagem = { papel: "usuario" | "assistente"; texto: string };

export const MAX_CARACTERES = 500;
export const MAX_MENSAGENS = 6;

type Resultado =
  | { ok: true; mensagens: Mensagem[]; cliente: string }
  | { ok: false; erro: string };

function ehMensagem(m: unknown): m is Mensagem {
  if (!m || typeof m !== "object") return false;
  const { papel, texto } = m as Record<string, unknown>;
  return (papel === "usuario" || papel === "assistente") && typeof texto === "string";
}

/** Valida o corpo enviado pelo widget e corta o histórico às últimas mensagens. */
export function validarEntrada(corpo: unknown): Resultado {
  if (!corpo || typeof corpo !== "object") return { ok: false, erro: "Envie uma pergunta." };
  const { mensagens, cliente } = corpo as Record<string, unknown>;

  if (!Array.isArray(mensagens) || mensagens.length === 0 || !mensagens.every(ehMensagem)) {
    return { ok: false, erro: "Envie uma pergunta." };
  }
  const recentes = (mensagens as Mensagem[])
    .slice(-MAX_MENSAGENS)
    .map((m) => ({ papel: m.papel, texto: m.texto.slice(0, 2000) }));
  const ultima = recentes[recentes.length - 1];

  if (ultima.papel !== "usuario" || ultima.texto.trim() === "") {
    return { ok: false, erro: "Escreva sua pergunta." };
  }
  if (ultima.texto.length > MAX_CARACTERES) {
    return { ok: false, erro: `A pergunta pode ter até ${MAX_CARACTERES} caracteres.` };
  }

  return {
    ok: true,
    mensagens: recentes,
    cliente: typeof cliente === "string" ? cliente.slice(0, 64) : "",
  };
}

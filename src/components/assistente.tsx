"use client";

import { useEffect, useRef, useState } from "react";
import type { Mensagem } from "@/lib/assistente/entrada";
import { FAQ } from "@/lib/assistente/faq";

type Item =
  | { tipo: "msg"; papel: "usuario" | "assistente"; texto: string }
  | { tipo: "chips"; opcoes: string[]; prontas: boolean };

const SUGESTOES = [FAQ[0].pergunta, FAQ[2].pergunta, FAQ[3].pergunta, FAQ[5].pergunta];

function idDoCliente(): string {
  const novo = () => Math.random().toString(36).slice(2, 12);
  try {
    let id = localStorage.getItem("ast-cliente");
    if (!id) {
      id = novo();
      localStorage.setItem("ast-cliente", id);
    }
    return id;
  } catch {
    return novo();
  }
}

export function Assistente() {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<Item[]>([
    { tipo: "msg", papel: "assistente", texto: "Oi! 👋 Sou o assistente do Chef’s Match. Pode perguntar qualquer coisa sobre o projeto. Algumas ideias:" },
    { tipo: "chips", opcoes: SUGESTOES, prontas: false },
  ]);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const historico = useRef<Mensagem[]>([]);
  const cliente = useRef("");
  const lista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight });
  }, [itens, ocupado, aberto]);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", fechar);
    return () => document.removeEventListener("keydown", fechar);
  }, [aberto]);

  const adicionar = (...novos: Item[]) => setItens((atual) => [...atual, ...novos]);

  function responderPronta(pergunta: string) {
    const f = FAQ.find((x) => x.pergunta === pergunta);
    adicionar({ tipo: "msg", papel: "usuario", texto: pergunta }, { tipo: "msg", papel: "assistente", texto: f?.resposta ?? "" });
  }

  async function perguntar(pergunta: string) {
    const limpa = pergunta.trim().slice(0, 500);
    if (!limpa || ocupado) return;
    if (!cliente.current) cliente.current = idDoCliente();
    setTexto("");
    setOcupado(true);
    adicionar({ tipo: "msg", papel: "usuario", texto: limpa });
    historico.current.push({ papel: "usuario", texto: limpa });

    try {
      const res = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: historico.current.slice(-6), cliente: cliente.current }),
        signal: AbortSignal.timeout(15000),
      });
      const json = await res.json();
      if (!res.ok || typeof json?.resposta !== "string") throw new Error("falhou");
      historico.current.push({ papel: "assistente", texto: json.resposta });
      adicionar({ tipo: "msg", papel: "assistente", texto: json.resposta });
    } catch {
      historico.current.pop();
      adicionar(
        { tipo: "msg", papel: "assistente", texto: "A IA está ocupada agora, mas olha as perguntas mais comuns:" },
        { tipo: "chips", opcoes: FAQ.map((f) => f.pergunta), prontas: true },
      );
    } finally {
      setOcupado(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Tirar dúvidas sobre o Chef's Match"
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-full bg-orange px-4 py-3 font-bold text-ink shadow-lg shadow-black/40 hover:bg-orange-hi md:bottom-6"
      >
        <span aria-hidden className="text-xl leading-none">💬</span> Dúvidas?
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Assistente do Chef's Match"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-ink-2 text-paper sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[min(560px,calc(100dvh-2rem))] sm:w-[380px] sm:rounded-2xl sm:border sm:border-line sm:shadow-2xl sm:shadow-black/60"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-ink px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3.5">
        <div>
          <p className="font-display text-lg font-bold uppercase">Assistente Chef&apos;s Match</p>
          <p className="text-xs text-muted">Pergunte o que quiser sobre o projeto</p>
        </div>
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="rounded-lg px-2 py-1 text-2xl leading-none">
          ×
        </button>
      </div>

      <div ref={lista} aria-live="polite" className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {itens.map((item, i) =>
          item.tipo === "msg" ? (
            <p
              key={i}
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] ${
                item.papel === "usuario"
                  ? "self-end rounded-br-sm bg-orange text-ink"
                  : "self-start rounded-bl-sm border border-line bg-ink-3"
              }`}
            >
              {item.texto}
            </p>
          ) : (
            <div key={i} className="flex flex-wrap gap-1.5">
              {item.opcoes.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => (item.prontas ? responderPronta(op) : perguntar(op))}
                  className="rounded-full border border-orange/70 bg-orange/10 px-3 py-1.5 text-left text-sm hover:bg-orange/20"
                >
                  {op}
                </button>
              ))}
            </div>
          ),
        )}
        {ocupado && <p className="self-start text-sm text-muted italic">digitando…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          perguntar(texto);
        }}
        className="flex gap-2 border-t border-line bg-ink p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          placeholder="Escreva sua dúvida…"
          aria-label="Sua dúvida"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-base text-paper placeholder:text-muted"
        />
        <button type="submit" disabled={ocupado} className="rounded-xl bg-orange px-4 font-bold text-ink disabled:opacity-50">
          Enviar
        </button>
      </form>
    </div>
  );
}

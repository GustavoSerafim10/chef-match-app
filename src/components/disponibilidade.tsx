import { alternarDisponibilidade } from "@/app/actions/app";
import { SubmitButton } from "./submit-button";

export function Disponibilidade({ ligado, voltar = "/painel" }: { ligado: boolean; voltar?: string }) {
  return (
    <form
      action={alternarDisponibilidade}
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 ${
        ligado ? "bg-orange text-ink" : "border-2 border-dashed border-line bg-ink-2"
      }`}
    >
      <input type="hidden" name="ligar" value={ligado ? "0" : "1"} />
      <input type="hidden" name="voltar" value={voltar} />
      <div>
        <p className="font-display text-2xl font-bold uppercase leading-none">
          {ligado ? "⚡ Disponível hoje" : "Você está indisponível hoje"}
        </p>
        <p className={`mt-1 text-sm ${ligado ? "text-ink/80" : "text-muted"}`}>
          {ligado
            ? "Restaurantes que precisam de alguém hoje podem te encontrar e convidar."
            : "Ligue para aparecer nas buscas urgentes de restaurantes perto de você."}
        </p>
      </div>
      <SubmitButton
        pendingText="…"
        className={`rounded-full px-5 py-2.5 text-sm font-bold transition cursor-pointer ${
          ligado ? "bg-ink text-paper hover:bg-ink-3" : "bg-orange text-ink hover:bg-orange-hi"
        }`}
      >
        {ligado ? "Desligar" : "Estou disponível hoje"}
      </SubmitButton>
    </form>
  );
}

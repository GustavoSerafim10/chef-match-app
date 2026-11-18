import { alternarDisponibilidade } from "@/app/actions/app";
import { SubmitButton } from "./submit-button";

/** Interruptor "disponível hoje". Ligado: card com borda verde pulsando e selo "Online agora". */
export function Disponibilidade({ ligado, voltar = "/painel" }: { ligado: boolean; voltar?: string }) {
  return (
    <form
      action={alternarDisponibilidade}
      className={`vidro flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 ${
        ligado ? "online !border-ok/70 bg-[linear-gradient(135deg,rgb(63_179_127/.16),rgb(24_22_20/.75))]" : "!border-orange/40"
      }`}
    >
      <input type="hidden" name="ligar" value={ligado ? "0" : "1"} />
      <input type="hidden" name="voltar" value={voltar} />
      <div>
        {ligado && (
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ok/15 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-ok">
            <span className="ponto-online h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
            Online agora
          </p>
        )}
        <p className="font-display text-2xl font-bold uppercase leading-none">
          {ligado ? "⚡ Disponível hoje" : "Você está indisponível hoje"}
        </p>
        <p className="mt-1 text-sm text-soft">
          {ligado
            ? "Restaurantes que precisam de alguém hoje podem te encontrar e convidar."
            : "Ligue para aparecer nas buscas urgentes de restaurantes perto de você."}
        </p>
      </div>
      <SubmitButton
        pendingText="…"
        className={`group inline-flex cursor-pointer items-center gap-3 rounded-full py-2 pl-5 pr-2 text-sm font-bold transition-all duration-300 ${
          ligado ? "bg-ok/20 text-paper ring-1 ring-ok/60 hover:bg-ok/30" : "brilho bg-orange text-ink hover:bg-orange-hi"
        }`}
      >
        {ligado ? "Desligar" : "Estou disponível hoje"}
        <span
          aria-hidden="true"
          className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${ligado ? "bg-ok" : "bg-ink/70"}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-paper shadow transition-all duration-300 ${ligado ? "left-6" : "left-1"}`}
          />
        </span>
      </SubmitButton>
    </form>
  );
}

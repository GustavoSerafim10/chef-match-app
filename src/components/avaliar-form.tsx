import { avaliar } from "@/app/actions/app";
import { SubmitButton } from "./submit-button";
import { btnSm, input } from "./ui";

export function AvaliarForm({
  avaliadoId,
  avaliadoNome,
  contexto,
  referenciaId,
  voltar,
}: {
  avaliadoId: string;
  avaliadoNome: string;
  contexto: "vaga" | "cotacao";
  referenciaId: string;
  voltar: string;
}) {
  const id = `${referenciaId}-${avaliadoId}`;
  return (
    <form action={avaliar} className="grid gap-3 rounded-xl border border-orange/40 bg-orange/5 p-4">
      <p className="text-sm font-bold">
        Avaliar <span className="text-orange">{avaliadoNome}</span>
      </p>
      <input type="hidden" name="avaliado_id" value={avaliadoId} />
      <input type="hidden" name="contexto" value={contexto} />
      <input type="hidden" name="referencia_id" value={referenciaId} />
      <input type="hidden" name="voltar" value={voltar} />
      <fieldset className="flex flex-row-reverse justify-end gap-1" aria-label="Nota de 1 a 5">
        {[5, 4, 3, 2, 1].map((n) => (
          <label
            key={n}
            className="peer cursor-pointer text-3xl leading-none text-line transition hover:text-orange has-checked:text-orange peer-hover:text-orange peer-has-checked:text-orange"
          >
            <input type="radio" name="nota" value={n} required className="sr-only" id={`${id}-n${n}`} />
            <span aria-hidden="true">★</span>
            <span className="sr-only">{n} estrela{n > 1 ? "s" : ""}</span>
          </label>
        ))}
      </fieldset>
      <textarea
        name="comentario"
        id={`${id}-comentario`}
        rows={2}
        maxLength={500}
        placeholder="Conte como foi a experiência (opcional)"
        className={input}
      />
      <SubmitButton className={`${btnSm} justify-self-start`} pendingText="Enviando…">
        Enviar avaliação
      </SubmitButton>
    </form>
  );
}

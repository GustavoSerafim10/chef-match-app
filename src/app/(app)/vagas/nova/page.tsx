import { redirect } from "next/navigation";
import { criarVaga } from "@/app/actions/app";
import { SubmitButton } from "@/components/submit-button";
import { Notice, PageTitle, btn, input, label, lerAvisos, type SP } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { FUNCOES, REGIOES } from "@/lib/constants";

export const metadata = { title: "Nova vaga · Chef's Match" };

export default async function NovaVaga({ searchParams }: { searchParams: SP }) {
  const { erro, sp } = await lerAvisos(searchParams);
  const { profile } = await getContexto();
  if (profile.role !== "empresa") redirect("/vagas");
  const urgente = sp.urgente === "1";

  return (
    <div className="max-w-xl">
      <Notice erro={erro} />
      <PageTitle eyebrow={urgente ? "Contratação urgente" : "Talentos"} title={urgente ? "Preciso de alguém hoje" : "Nova vaga"}>
        {urgente
          ? "Informe a função, o turno e a diária. Na próxima tela você vê quem está disponível hoje, por compatibilidade."
          : "Vagas com salário e jornada claros recebem mais candidaturas."}
      </PageTitle>
      <form action={criarVaga} className="grid gap-4">
        <input type="hidden" name="urgente" value={urgente ? "1" : "0"} />
        <label className="grid gap-1.5">
          <span className={label}>Função</span>
          <select id="funcao" name="funcao" required className={input} defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {FUNCOES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>

        {!urgente && (
          <fieldset className="grid gap-1.5">
            <legend className={`${label} mb-1.5`}>Tipo de contratação</legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["efetivo", "Efetivo"],
                ["temporario", "Temporário"],
                ["extra", "Extra"],
              ].map(([v, t], i) => (
                <label
                  key={v}
                  className="cursor-pointer rounded-xl border-2 border-line px-3 py-2.5 text-center text-sm font-semibold has-checked:border-orange has-checked:bg-orange/10"
                >
                  <input type="radio" name="tipo" value={v} defaultChecked={i === 0} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={label}>{urgente ? "Diária" : "Remuneração"}</span>
            <input id="remuneracao" name="remuneracao" required className={input} placeholder={urgente ? "R$ 180" : "R$ 2.400/mês"} />
          </label>
          <label className="grid gap-1.5">
            <span className={label}>{urgente ? "Turno de hoje" : "Horário / escala"}</span>
            <input id="horario" name="horario" className={input} placeholder={urgente ? "18h às 00h" : "16h às 00h, 6x1"} />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={label}>Região</span>
          <select id="regiao" name="regiao" className={input} defaultValue={profile.regiao ?? ""}>
            <option value="">Selecione</option>
            {REGIOES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className={label}>Detalhes (opcional)</span>
          <textarea
            id="descricao"
            name="descricao"
            rows={3}
            className={input}
            placeholder="Experiência desejada, uniforme, benefícios, endereço de referência…"
          />
        </label>

        <SubmitButton className={`${btn} mt-2`} pendingText="Publicando…">
          {urgente ? "⚡ Buscar profissionais agora" : "Publicar vaga"}
        </SubmitButton>
      </form>
    </div>
  );
}

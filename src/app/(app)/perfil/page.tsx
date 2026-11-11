import Link from "next/link";
import { sair } from "@/app/actions/auth";
import { atualizarPerfil } from "@/app/actions/app";
import { Disponibilidade } from "@/components/disponibilidade";
import { SubmitButton } from "@/components/submit-button";
import { Notice, PageTitle, btn, btnGhost, input, label, lerAvisos, type SP } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { FUNCOES, REGIOES, ROLE_LABEL } from "@/lib/constants";
import { disponivelHoje } from "@/lib/utils";

export const metadata = { title: "Meu perfil · Chef's Match" };

export default async function Perfil({ searchParams }: { searchParams: SP }) {
  const { erro, msg } = await lerAvisos(searchParams);
  const { profile, user } = await getContexto();
  const pro = profile.role === "profissional";

  return (
    <div className="max-w-xl">
      <Notice erro={erro} msg={msg} />
      <PageTitle eyebrow={ROLE_LABEL[profile.role]} title="Meu perfil">
        <Link href={`/perfil/${profile.id}`} className="font-semibold text-orange">
          Ver como os outros me veem →
        </Link>
      </PageTitle>

      {pro && (
        <div className="mb-6">
          <Disponibilidade ligado={disponivelHoje(profile)} voltar="/perfil" />
        </div>
      )}

      <form action={atualizarPerfil} className="grid gap-4">
        <label className="grid gap-1.5">
          <span className={label}>{pro ? "Nome" : "Nome do negócio"}</span>
          <input id="nome" name="nome" required defaultValue={profile.nome} className={input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
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
            <span className={label}>WhatsApp (aparece só depois de combinado)</span>
            <input id="telefone" name="telefone" defaultValue={profile.telefone ?? ""} className={input} placeholder="(61) 9 0000-0000" />
          </label>
        </div>

        {pro && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className={label}>Função principal</span>
                <select id="funcao" name="funcao" className={input} defaultValue={profile.funcao ?? ""}>
                  <option value="">Selecione</option>
                  {FUNCOES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className={label}>Anos de experiência</span>
                <input
                  id="experiencia_anos"
                  name="experiencia_anos"
                  type="number"
                  min={0}
                  max={50}
                  defaultValue={profile.experiencia_anos ?? 0}
                  className={input}
                />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className={label}>Especialidades (separe por vírgula)</span>
              <input
                id="especialidades"
                name="especialidades"
                defaultValue={(profile.especialidades ?? []).join(", ")}
                className={input}
                placeholder="Massas, Carnes, Comida brasileira"
              />
            </label>
          </>
        )}

        <label className="grid gap-1.5">
          <span className={label}>{pro ? "Sobre você" : "Sobre o negócio"}</span>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio ?? ""}
            className={input}
            placeholder={pro ? "Onde já trabalhou, cursos, o que te diferencia…" : "Tipo de cozinha, porte, o que oferece…"}
          />
        </label>

        <SubmitButton className={btn} pendingText="Salvando…">
          Salvar perfil
        </SubmitButton>
      </form>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="text-sm text-muted">{user.email}</p>
        <form action={sair}>
          <button type="submit" className={btnGhost}>
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

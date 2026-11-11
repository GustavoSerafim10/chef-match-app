"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContexto } from "@/lib/auth";
import { hoje, texto } from "@/lib/utils";

const voltar = (rota: string, tipo: "erro" | "msg", m: string) =>
  redirect(`${rota}${rota.includes("?") ? "&" : "?"}${tipo}=${encodeURIComponent(m)}`);

function destino(fd: FormData, padrao: string) {
  const v = texto(fd, "voltar");
  return v.startsWith("/") ? v : padrao;
}

/* ---------------- Perfil ---------------- */

export async function alternarDisponibilidade(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const ligar = texto(formData, "ligar") === "1";
  await supabase
    .from("profiles")
    .update({ disponivel_hoje: ligar, disponivel_em: ligar ? hoje() : null })
    .eq("id", profile.id);
  revalidatePath("/", "layout");
  voltar(destino(formData, "/painel"), "msg", ligar ? "Você está disponível hoje. Restaurantes já podem te convidar!" : "Disponibilidade desligada.");
}

export async function atualizarPerfil(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const nome = texto(formData, "nome");
  if (!nome) voltar("/perfil", "erro", "O nome não pode ficar vazio.");
  const exp = Number(texto(formData, "experiencia_anos") || 0);
  const especialidades = texto(formData, "especialidades")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  const { error } = await supabase
    .from("profiles")
    .update({
      nome,
      regiao: texto(formData, "regiao") || null,
      telefone: texto(formData, "telefone") || null,
      bio: texto(formData, "bio") || null,
      ...(profile.role === "profissional"
        ? { funcao: texto(formData, "funcao") || null, experiencia_anos: Number.isFinite(exp) ? Math.max(0, Math.min(50, exp)) : 0, especialidades }
        : {}),
    })
    .eq("id", profile.id);
  if (error) voltar("/perfil", "erro", "Não foi possível salvar. Tente de novo.");
  revalidatePath("/", "layout");
  voltar("/perfil", "msg", "Perfil atualizado.");
}

/* ---------------- Vagas ---------------- */

export async function criarVaga(formData: FormData) {
  const { supabase, profile } = await getContexto();
  if (profile.role !== "empresa") voltar("/painel", "erro", "Só estabelecimentos publicam vagas.");
  const urgente = texto(formData, "urgente") === "1";
  const funcao = texto(formData, "funcao");
  const remuneracao = texto(formData, "remuneracao");
  if (!funcao || !remuneracao) voltar(`/vagas/nova${urgente ? "?urgente=1" : ""}`, "erro", "Informe a função e a remuneração.");

  const tipo = urgente ? "extra" : texto(formData, "tipo") || "efetivo";
  const { data, error } = await supabase
    .from("vagas")
    .insert({
      empresa_id: profile.id,
      funcao,
      tipo,
      remuneracao,
      horario: texto(formData, "horario") || null,
      regiao: texto(formData, "regiao") || profile.regiao,
      descricao: texto(formData, "descricao") || null,
      urgente,
      data_turno: urgente ? hoje() : texto(formData, "data_turno") || null,
    })
    .select("id")
    .single();
  if (error || !data) voltar("/vagas/nova", "erro", "Não foi possível publicar a vaga.");
  revalidatePath("/", "layout");
  voltar(`/vagas/${data!.id}`, "msg", urgente ? "Vaga urgente publicada! Veja abaixo quem está disponível hoje." : "Vaga publicada!");
}

export async function fecharVaga(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const id = texto(formData, "id");
  await supabase.from("vagas").update({ status: "fechada" }).eq("id", id).eq("empresa_id", profile.id);
  revalidatePath("/", "layout");
  voltar(`/vagas/${id}`, "msg", "Vaga encerrada.");
}

export async function candidatar(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const vagaId = texto(formData, "vaga_id");
  const rota = destino(formData, `/vagas/${vagaId}`);
  if (profile.role !== "profissional") voltar(rota, "erro", "Só profissionais se candidatam.");
  const { error } = await supabase
    .from("candidaturas")
    .insert({ vaga_id: vagaId, profissional_id: profile.id, origem: "candidatura" });
  if (error) voltar(rota, "erro", error.code === "23505" ? "Você já se candidatou a essa vaga." : "Não foi possível se candidatar.");
  revalidatePath("/", "layout");
  voltar(rota, "msg", "Candidatura enviada! Acompanhe o status no seu painel.");
}

export async function convidar(formData: FormData) {
  const { supabase } = await getContexto();
  const vagaId = texto(formData, "vaga_id");
  const { error } = await supabase
    .from("candidaturas")
    .insert({ vaga_id: vagaId, profissional_id: texto(formData, "profissional_id"), origem: "convite" });
  if (error) voltar(`/vagas/${vagaId}`, "erro", error.code === "23505" ? "Essa pessoa já está nessa vaga." : "Não foi possível convidar.");
  revalidatePath("/", "layout");
  voltar(`/vagas/${vagaId}`, "msg", "Convite enviado! A pessoa vê no painel dela.");
}

export async function responderCandidatura(formData: FormData) {
  const { supabase } = await getContexto();
  const status = texto(formData, "status");
  if (!["aceita", "recusada"].includes(status)) return;
  await supabase.from("candidaturas").update({ status }).eq("id", texto(formData, "id"));
  revalidatePath("/", "layout");
  voltar(destino(formData, "/painel"), "msg", status === "aceita" ? "Combinado! Agora é só se falarem." : "Resposta registrada.");
}

/* ---------------- Fornecedores ---------------- */

export async function criarProduto(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const nome = texto(formData, "nome");
  if (!nome) voltar("/produtos", "erro", "Informe o nome do produto.");
  const preco = Number(texto(formData, "preco").replace(",", "."));
  await supabase.from("produtos").insert({
    fornecedor_id: profile.id,
    nome,
    categoria: texto(formData, "categoria") || "Outros",
    unidade: texto(formData, "unidade") || "un",
    preco: Number.isFinite(preco) && preco > 0 ? preco : null,
  });
  revalidatePath("/produtos");
  voltar("/produtos", "msg", "Produto adicionado ao catálogo.");
}

export async function removerProduto(formData: FormData) {
  const { supabase, profile } = await getContexto();
  await supabase.from("produtos").delete().eq("id", texto(formData, "id")).eq("fornecedor_id", profile.id);
  revalidatePath("/produtos");
  voltar("/produtos", "msg", "Produto removido.");
}

export async function criarCotacao(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const titulo = texto(formData, "titulo");
  const itens = texto(formData, "itens");
  if (!titulo || !itens) voltar("/cotacoes", "erro", "Dê um título e liste os itens.");
  const { data, error } = await supabase
    .from("cotacoes")
    .insert({ empresa_id: profile.id, titulo, itens, categoria: texto(formData, "categoria") || null })
    .select("id")
    .single();
  if (error || !data) voltar("/cotacoes", "erro", "Não foi possível criar a cotação.");
  revalidatePath("/", "layout");
  voltar(`/cotacoes/${data!.id}`, "msg", "Cotação enviada aos fornecedores!");
}

export async function enviarProposta(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const cotacaoId = texto(formData, "cotacao_id");
  const rota = `/cotacoes/${cotacaoId}`;
  const preco = Number(texto(formData, "preco_total").replace(".", "").replace(",", "."));
  const prazo = Number(texto(formData, "prazo_dias"));
  if (!Number.isFinite(preco) || preco <= 0 || !Number.isFinite(prazo) || prazo < 0) voltar(rota, "erro", "Informe preço e prazo válidos.");
  const { error } = await supabase.from("propostas").insert({
    cotacao_id: cotacaoId,
    fornecedor_id: profile.id,
    preco_total: preco,
    prazo_dias: Math.round(prazo),
    frete: texto(formData, "frete") || null,
    pagamento: texto(formData, "pagamento") || null,
  });
  if (error) voltar(rota, "erro", error.code === "23505" ? "Você já enviou proposta para essa cotação." : "Não foi possível enviar.");
  revalidatePath("/", "layout");
  voltar(rota, "msg", "Proposta enviada!");
}

export async function aceitarProposta(formData: FormData) {
  const { supabase } = await getContexto();
  const cotacaoId = texto(formData, "cotacao_id");
  await supabase.from("propostas").update({ aceita: true }).eq("id", texto(formData, "id"));
  await supabase.from("cotacoes").update({ status: "fechada" }).eq("id", cotacaoId);
  revalidatePath("/", "layout");
  voltar(`/cotacoes/${cotacaoId}`, "msg", "Pedido aprovado! Depois da entrega, avalie o fornecedor.");
}

/* ---------------- Avaliações (Chef's Match Qualidade) ---------------- */

export async function avaliar(formData: FormData) {
  const { supabase, profile } = await getContexto();
  const rota = destino(formData, "/painel");
  const avaliadoId = texto(formData, "avaliado_id");
  const contexto = texto(formData, "contexto");
  const referenciaId = texto(formData, "referencia_id");
  const nota = Number(texto(formData, "nota"));
  if (!(nota >= 1 && nota <= 5)) voltar(rota, "erro", "Escolha uma nota de 1 a 5.");

  // Só avalia quem teve uma experiência real e concluída no app.
  let valido = false;
  if (contexto === "vaga") {
    const { data: c } = await supabase
      .from("candidaturas")
      .select("status, profissional_id, vaga:vagas!candidaturas_vaga_id_fkey(empresa_id)")
      .eq("id", referenciaId)
      .single();
    const empresaId = (c?.vaga as unknown as { empresa_id: string } | null)?.empresa_id;
    valido =
      c?.status === "aceita" &&
      ((profile.id === empresaId && avaliadoId === c.profissional_id) ||
        (profile.id === c.profissional_id && avaliadoId === empresaId));
  } else if (contexto === "cotacao") {
    const { data: p } = await supabase
      .from("propostas")
      .select("aceita, fornecedor_id, cotacao:cotacoes!propostas_cotacao_id_fkey(empresa_id)")
      .eq("id", referenciaId)
      .single();
    const empresaId = (p?.cotacao as unknown as { empresa_id: string } | null)?.empresa_id;
    valido =
      p?.aceita === true &&
      ((profile.id === empresaId && avaliadoId === p.fornecedor_id) ||
        (profile.id === p.fornecedor_id && avaliadoId === empresaId));
  }
  if (!valido) voltar(rota, "erro", "Só é possível avaliar depois de uma experiência confirmada no app.");

  const { error } = await supabase.from("avaliacoes").insert({
    autor_id: profile.id,
    avaliado_id: avaliadoId,
    nota,
    comentario: texto(formData, "comentario").slice(0, 500) || null,
    contexto,
    referencia_id: referenciaId,
  });
  if (error) voltar(rota, "erro", error.code === "23505" ? "Você já avaliou essa experiência." : "Não foi possível enviar a avaliação.");
  revalidatePath("/", "layout");
  voltar(rota, "msg", "Avaliação enviada. Obrigado por fortalecer a confiança na gastronomia!");
}

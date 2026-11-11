// Dados de demonstração do Chef's Match.
// Uso:
//   node scripts/seed.mjs                  cria contas, vagas, cotações e avaliações (uma vez)
//   node scripts/seed.mjs --disponibilidade  só marca os profissionais demo como "disponível hoje"
//                                          (rode no dia da apresentação: a disponibilidade vale só para o dia)
//
// Todas as contas demo usam a senha: chefmatch2026

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SENHA = "chefmatch2026";
const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

const EMPRESAS = [
  { email: "bistro.cerrado@chefmatch.app", nome: "Bistrô Cerrado", regiao: "Asa Sul", telefone: "(61) 99811-2040", bio: "Cozinha brasileira contemporânea com ingredientes do Cerrado. 80 lugares." },
  { email: "sabor.dolago@chefmatch.app", nome: "Sabor do Lago", regiao: "Lago Sul", telefone: "(61) 99702-3311", bio: "Restaurante de frutos do mar à beira do Paranoá." },
  { email: "pao.planalto@chefmatch.app", nome: "Padaria Pão do Planalto", regiao: "Águas Claras", telefone: "(61) 99655-7788", bio: "Padaria e confeitaria artesanal, aberta das 6h às 22h." },
];

const PROFISSIONAIS = [
  { email: "lucas.mendes@chefmatch.app", nome: "Lucas Mendes", regiao: "Asa Sul", funcao: "Garçom", exp: 5, esp: ["Salão cheio", "Vinhos", "Inglês básico"], disp: true, telefone: "(61) 98100-1111", bio: "Garçom há 5 anos em restaurantes da Asa Sul. Acostumado com casa cheia." },
  { email: "ana.ribeiro@chefmatch.app", nome: "Ana Paula Ribeiro", regiao: "Asa Norte", funcao: "Garçom", exp: 3, esp: ["Eventos", "Atendimento"], disp: true, telefone: "(61) 98100-2222" },
  { email: "davi.rocha@chefmatch.app", nome: "Davi Rocha", regiao: "Sudoeste", funcao: "Garçom", exp: 2, esp: ["Bar", "Atendimento"], disp: true, telefone: "(61) 98100-3333" },
  { email: "joana.silva@chefmatch.app", nome: "Joana Silva", regiao: "Asa Sul", funcao: "Cozinheiro(a)", exp: 4, esp: ["Comida brasileira", "Massas", "Carnes"], disp: true, telefone: "(61) 98100-4444", bio: "Cozinheira de linha, passou por hotel e bistrô. Curso de boas práticas." },
  { email: "carlos.teixeira@chefmatch.app", nome: "Carlos Teixeira", regiao: "Taguatinga", funcao: "Cozinheiro(a)", exp: 6, esp: ["Grelhados", "Churrasco"], disp: false, telefone: "(61) 98100-5555" },
  { email: "rafael.lima@chefmatch.app", nome: "Rafael Lima", regiao: "Asa Norte", funcao: "Bartender", exp: 4, esp: ["Coquetelaria", "Drinks autorais"], disp: true, telefone: "(61) 98100-6666" },
  { email: "bia.ferreira@chefmatch.app", nome: "Bia Ferreira", regiao: "Águas Claras", funcao: "Confeiteiro(a)", exp: 3, esp: ["Bolos", "Doces finos"], disp: false, telefone: "(61) 98100-7777" },
  { email: "pedro.alves@chefmatch.app", nome: "Pedro Alves", regiao: "Guará", funcao: "Auxiliar de cozinha", exp: 1, esp: ["Mise en place", "Boas práticas"], disp: true, telefone: "(61) 98100-8888", bio: "Primeiro emprego na gastronomia. Fiz curso de boas práticas e quero crescer." },
];

const FORNECEDORES = [
  { email: "hortifruti.planalto@chefmatch.app", nome: "Hortifruti Planalto", regiao: "Guará", telefone: "(61) 3344-1010", produtos: [["Tomate italiano", "Hortifruti", "kg", 6.9], ["Batata lavada", "Hortifruti", "kg", 4.5], ["Cebola", "Hortifruti", "kg", 3.9], ["Alface americana", "Hortifruti", "cx", 18]] },
  { email: "verde.cerrado@chefmatch.app", nome: "Verde Cerrado Distribuidora", regiao: "Taguatinga", telefone: "(61) 3355-2020", produtos: [["Tomate italiano", "Hortifruti", "kg", 6.5], ["Pequi", "Hortifruti", "kg", 14], ["Baru", "Hortifruti", "kg", 52]] },
  { email: "ceasa.direto@chefmatch.app", nome: "Ceasa Direto DF", regiao: "Outra região do DF", telefone: "(61) 3366-3030", produtos: [["Batata lavada", "Hortifruti", "kg", 3.8], ["Cebola", "Hortifruti", "kg", 3.2]] },
  { email: "carnes.nobre@chefmatch.app", nome: "Carnes Nobre DF", regiao: "Asa Norte", telefone: "(61) 3377-4040", produtos: [["Picanha", "Carnes e aves", "kg", 79.9], ["Filé de frango", "Carnes e aves", "kg", 21.5], ["Costela suína", "Carnes e aves", "kg", 29.9]] },
];

async function entrar(conta, role, extra = {}) {
  const sb = createClient(URL_, KEY, { auth: { persistSession: false } });
  let { data, error } = await sb.auth.signInWithPassword({ email: conta.email, password: SENHA });
  if (error) {
    ({ data, error } = await sb.auth.signUp({
      email: conta.email,
      password: SENHA,
      options: { data: { role, nome: conta.nome, regiao: conta.regiao, funcao: conta.funcao ?? null } },
    }));
    if (error || !data.session) throw new Error(`${conta.email}: ${error?.message ?? "sem sessão (confirmação de e-mail ligada?)"}`);
  }
  const id = data.user.id;
  const { error: e2 } = await sb.from("profiles").update({ telefone: conta.telefone ?? null, bio: conta.bio ?? null, ...extra }).eq("id", id);
  if (e2) throw new Error(`perfil ${conta.email}: ${e2.message}`);
  return { sb, id, ...conta };
}

const ok = (r, msg) => {
  if (r.error) throw new Error(`${msg}: ${r.error.message}`);
  return r.data;
};

async function marcarDisponiveis() {
  for (const p of PROFISSIONAIS) {
    await entrar(p, "profissional", {
      funcao: p.funcao,
      experiencia_anos: p.exp,
      especialidades: p.esp,
      disponivel_hoje: p.disp,
      disponivel_em: p.disp ? hoje : null,
    });
    console.log(`  ${p.disp ? "⚡" : "  "} ${p.nome}`);
  }
}

async function main() {
  if (process.argv.includes("--disponibilidade")) {
    console.log(`Marcando disponibilidade para ${hoje}…`);
    await marcarDisponiveis();
    console.log("Pronto.");
    return;
  }

  console.log("Criando contas…");
  const emp = {};
  for (const e of EMPRESAS) emp[e.nome] = await entrar(e, "empresa");
  const pro = {};
  for (const p of PROFISSIONAIS) {
    pro[p.nome] = await entrar(p, "profissional", {
      funcao: p.funcao,
      experiencia_anos: p.exp,
      especialidades: p.esp,
      disponivel_hoje: p.disp,
      disponivel_em: p.disp ? hoje : null,
    });
  }
  const forn = {};
  for (const f of FORNECEDORES) forn[f.nome] = await entrar(f, "fornecedor");

  const { count } = await emp["Bistrô Cerrado"].sb.from("vagas").select("id", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("Já existem vagas: os dados demo já foram criados. Atualizei só perfis e disponibilidade.");
    return;
  }

  console.log("Catálogos…");
  for (const f of FORNECEDORES) {
    ok(
      await forn[f.nome].sb.from("produtos").insert(
        f.produtos.map(([nome, categoria, unidade, preco]) => ({ fornecedor_id: forn[f.nome].id, nome, categoria, unidade, preco })),
      ),
      "produtos",
    );
  }

  console.log("Vagas…");
  const bistro = emp["Bistrô Cerrado"];
  const lago = emp["Sabor do Lago"];
  const padaria = emp["Padaria Pão do Planalto"];
  const novaVaga = async (e, v) => ok(await e.sb.from("vagas").insert({ empresa_id: e.id, regiao: e.regiao, ...v }).select().single(), "vaga");

  // Histórico: contratações já concluídas (geram reputação verificada)
  const vHist1 = await novaVaga(bistro, { funcao: "Garçom", tipo: "extra", remuneracao: "R$ 180 a diária", horario: "18h às 00h", descricao: "Sábado de casa cheia.", status: "fechada" });
  const vHist2 = await novaVaga(lago, { funcao: "Cozinheiro(a)", tipo: "temporario", remuneracao: "R$ 2.800/mês", horario: "11h às 19h", descricao: "Temporada de férias, 3 meses.", status: "fechada" });
  const vHist3 = await novaVaga(lago, { funcao: "Garçom", tipo: "extra", remuneracao: "R$ 200 a diária", horario: "19h às 01h", descricao: "Evento corporativo.", status: "fechada" });

  // Vagas abertas
  await novaVaga(bistro, { funcao: "Cozinheiro(a)", tipo: "efetivo", remuneracao: "R$ 2.600/mês + VT + refeição", horario: "16h às 00h, escala 6x1", descricao: "Cozinha brasileira. Desejável 1 ano de experiência em praça quente." });
  const vUrg = await novaVaga(bistro, { funcao: "Garçom", tipo: "extra", urgente: true, data_turno: hoje, remuneracao: "R$ 180 a diária", horario: "18h às 00h", descricao: "Nosso garçom faltou e a casa está cheia hoje!" });
  await novaVaga(lago, { funcao: "Bartender", tipo: "temporario", remuneracao: "R$ 2.400/mês", horario: "18h às 02h, quinta a sábado", descricao: "Carta de drinks autorais. Temporada de verão." });
  const vPad = await novaVaga(padaria, { funcao: "Confeiteiro(a)", tipo: "efetivo", remuneracao: "R$ 2.300/mês", horario: "6h às 14h, 6x1", descricao: "Produção de bolos e doces finos." });
  await novaVaga(padaria, { funcao: "Auxiliar de cozinha", tipo: "efetivo", remuneracao: "R$ 1.750/mês", horario: "6h às 14h", descricao: "Primeiro emprego é bem-vindo. Treinamos." });

  console.log("Candidaturas e contratações…");
  const candidatar = async (p, vaga, origem = "candidatura") => {
    const quem = origem === "convite" ? emp[Object.keys(emp).find((k) => emp[k].id === vaga.empresa_id)] : p;
    return ok(await quem.sb.from("candidaturas").insert({ vaga_id: vaga.id, profissional_id: p.id, origem }).select().single(), "candidatura");
  };
  const empresaDe = (vaga) => Object.values(emp).find((e) => e.id === vaga.empresa_id);
  const aceitar = async (c, vaga) => ok(await empresaDe(vaga).sb.from("candidaturas").update({ status: "aceita" }).eq("id", c.id), "aceitar");
  const avaliar = async (autor, avaliado, nota, comentario, contexto, ref) =>
    ok(await autor.sb.from("avaliacoes").insert({ autor_id: autor.id, avaliado_id: avaliado.id, nota, comentario, contexto, referencia_id: ref }), "avaliar");

  const lucas = pro["Lucas Mendes"];
  const joana = pro["Joana Silva"];
  const ana = pro["Ana Paula Ribeiro"];
  const bia = pro["Bia Ferreira"];

  const c1 = await candidatar(lucas, vHist1);
  await aceitar(c1, vHist1);
  await avaliar(bistro, lucas, 5, "Chegou cedo, segurou o salão sozinho na pior hora. Chamaremos de novo.", "vaga", c1.id);
  await avaliar(lucas, bistro, 5, "Pagamento no fim do turno, equipe acolhedora e tudo como anunciado.", "vaga", c1.id);

  const c2 = await candidatar(joana, vHist2);
  await aceitar(c2, vHist2);
  await avaliar(lago, joana, 5, "Organizada, praça sempre pronta. Técnica excelente.", "vaga", c2.id);
  await avaliar(joana, lago, 4, "Ambiente bom e salário em dia. A escala mudou umas vezes sem aviso.", "vaga", c2.id);

  const c3 = await candidatar(lucas, vHist3, "convite");
  await lucas.sb.from("candidaturas").update({ status: "aceita" }).eq("id", c3.id);
  await avaliar(lago, lucas, 4, "Bom atendimento no evento, atento aos detalhes.", "vaga", c3.id);
  await avaliar(lucas, lago, 5, "Organização impecável e respeito com a equipe extra.", "vaga", c3.id);

  // Vaga urgente de hoje: duas candidaturas pendentes
  await candidatar(ana, vUrg);
  await candidatar(pro["Davi Rocha"], vUrg);
  await candidatar(bia, vPad);

  console.log("Cotações…");
  const cotacao = async (e, titulo, itens, categoria) =>
    ok(await e.sb.from("cotacoes").insert({ empresa_id: e.id, titulo, itens, categoria }).select().single(), "cotação");
  const proposta = async (f, cot, preco_total, prazo_dias, frete, pagamento) =>
    ok(
      await f.sb.from("propostas").insert({ cotacao_id: cot.id, fornecedor_id: f.id, preco_total, prazo_dias, frete, pagamento }).select().single(),
      "proposta",
    );

  // Cotação já concluída, com reputação
  const cotOld = await cotacao(lago, "Hortifruti da semana passada", "Tomate italiano: 15 kg\nCebola: 10 kg\nBatata: 20 kg", "Hortifruti");
  const pOld = await proposta(forn["Hortifruti Planalto"], cotOld, 289, 1, "Grátis", "Pix");
  await proposta(forn["Ceasa Direto DF"], cotOld, 262, 3, "R$ 25", "Pix");
  ok(await lago.sb.from("propostas").update({ aceita: true }).eq("id", pOld.id), "aceitar proposta");
  ok(await lago.sb.from("cotacoes").update({ status: "fechada" }).eq("id", cotOld.id), "fechar cotação");
  await avaliar(lago, forn["Hortifruti Planalto"], 5, "Entregou no dia seguinte, tudo fresco e conforme o pedido.", "cotacao", pOld.id);
  await avaliar(forn["Hortifruti Planalto"], lago, 5, "Pagamento na hora e recebimento organizado.", "cotacao", pOld.id);

  // Cotação aberta com três propostas, pronta para a demonstração
  const cotNova = await cotacao(bistro, "Hortifruti da semana", "Tomate italiano: 20 kg\nBatata lavada: 30 kg\nCebola: 15 kg\nAlface americana: 8 caixas", "Hortifruti");
  await proposta(forn["Hortifruti Planalto"], cotNova, 412, 1, "Grátis acima de R$ 300", "Pix ou boleto 14 dias");
  await proposta(forn["Ceasa Direto DF"], cotNova, 368, 2, "R$ 25", "Pix");
  await proposta(forn["Verde Cerrado Distribuidora"], cotNova, 395, 1, "R$ 15", "Boleto 28 dias");

  await cotacao(padaria, "Carnes para o almoço executivo", "Filé de frango: 25 kg\nCostela suína: 10 kg", "Carnes e aves");

  console.log("\nPronto! Contas demo (senha: chefmatch2026):");
  console.log("  Restaurante: bistro.cerrado@chefmatch.app");
  console.log("  Profissional: lucas.mendes@chefmatch.app");
  console.log("  Fornecedor: carnes.nobre@chefmatch.app");
}

main().catch((e) => {
  console.error("ERRO:", e.message);
  process.exit(1);
});

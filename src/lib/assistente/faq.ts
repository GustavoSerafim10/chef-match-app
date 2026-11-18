// Respostas prontas para quando a IA estiver indisponível.
// Manter igual ao array FAQ do site (chef-match/index.html). Ficam duplicadas de propósito:
// o site precisa delas mesmo com o app fora do ar.
export const FAQ: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "O que é o Chef’s Match?",
    resposta:
      "É uma plataforma que reúne quem trabalha, quem contrata e quem fornece para a gastronomia: vagas fixas e extras de última hora, cotação com fornecedores, capacitação (Academy) e conexão entre negócios. O lançamento é em Brasília/DF.",
  },
  {
    pergunta: "Para quem é o app?",
    resposta:
      "Para três públicos: profissionais da gastronomia (garçons, cozinheiros, auxiliares…), restaurantes e outros estabelecimentos que contratam e compram, e fornecedores de insumos.",
  },
  {
    pergunta: "Como o Chef’s Match ganha dinheiro?",
    resposta:
      "Com planos para empresas (R$ 149 a R$ 299 por mês) e fornecedores (R$ 99 a R$ 199), comissão de 2% a 5% nas compras do marketplace, cursos, recrutamento assistido e destaques. O profissional nunca paga para ver vagas. Os valores são hipóteses acadêmicas do projeto.",
  },
  {
    pergunta: "Qual é o diferencial?",
    resposta:
      "Integrar contratação, compras e capacitação num lugar só, com reputação verificada, compatibilidade entre vaga e profissional e acompanhamento depois da contratação. É o que falta no WhatsApp e nos grupos de indicação.",
  },
  {
    pergunta: "Onde e como vai começar?",
    resposta:
      "Em Brasília/DF, com um MVP enxuto primeiro e expansão depois. O ponto de equilíbrio estimado é de cerca de 22 clientes pagantes.",
  },
  {
    pergunta: "Como eu testo o app?",
    resposta:
      "Abra chef-match-app.vercel.app no celular e escolha “Testar como” restaurante, profissional ou fornecedor. Entra com um clique, sem cadastro.",
  },
  {
    pergunta: "Os números são reais?",
    resposta:
      "Os dados de mercado vêm da Abrasel e do Sebrae. Preços, metas e projeções são hipóteses do projeto acadêmico.",
  },
  {
    pergunta: "E o risco trabalhista?",
    resposta:
      "A plataforma aproxima as partes e quem contrata formaliza a contratação. Se um dia a empresa fornecer mão de obra temporária, vai seguir a Lei 6.019/1974.",
  },
];

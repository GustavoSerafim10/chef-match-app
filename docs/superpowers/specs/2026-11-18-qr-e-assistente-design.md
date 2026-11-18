# QR code + Assistente do Chef's Match — design curto

Data: 2026-11-18

## Por quê
Na apresentação da Rayanne, a turma deve conseguir **entrar no app pelo celular** (QR code) e
**tirar dúvidas sobre o projeto sozinha**, com um assistente automático que conhece o Chef's Match.
Quanto mais ele parecer "mágico" e confiável na hora, melhor.

## Objetivos
1. QR code grande apontando para https://chef-match-app.vercel.app:
   - no site (seção "app", com o texto "Aponte a câmera e teste junto");
   - em um slide da apresentação.
2. Balãozinho de chat 💬 no canto **do site e do app** que responde perguntas sobre o projeto em português
   (pedido do usuário: "o chat tanto no site tanto no app"). Os dois usam a mesma rota.

## Fora do escopo
- Chat entre pessoas (turma ↔ grupo) e histórico salvo de conversas.
- Responder assuntos que não têm a ver com o Chef's Match.

## Não pode acontecer (anti-objetivos)
- O assistente **inventar** números ou recursos que não estão no projeto.
- A chave da IA aparecer no site (código público).
- Alguém da turma gastar a cota com spam e o chat parar no meio da apresentação.
- O chat travar sem dar resposta nenhuma.

## Abordagens consideradas
- **A — IA de verdade (escolhida):** respostas livres, usando o conteúdo do projeto. Depende da API (Gemini grátis).
- B — Respostas prontas sem IA: grátis e à prova de falhas, mas não responde nada fora do roteiro.
- Decisão: A, com as respostas prontas de B como **plano B automático** quando a IA falhar.

## Como vai ser feito (minhas escolhas)
- **QR:** gerado como imagem SVG estática, embutida no site e no slide. Não depende de nenhum serviço externo na hora.
- **Custo zero (decisão do usuário):** é só para a apresentação, então nada pago. A API da Anthropic foi descartada
  porque exige cartão e créditos.
- **Cérebro do chat:** uma rota nova no app Next.js já hospedado na Vercel (`/api/assistente`). Ela chama a
  API do **Google Gemini no plano gratuito** (chave do AI Studio, sem cartão, então não tem como gerar cobrança),
  usando um modelo "flash" rápido. A chave fica como variável de ambiente na Vercel (`GEMINI_API_KEY`).
  Vercel Hobby e Supabase Free continuam no plano grátis.
- **Conhecimento:** as instruções do assistente incluem o texto do site + `ROTEIRO.md`. Regra: responder só com
  base nisso e, se não souber, dizer "boa pergunta pra fazer à Rayanne no final!".
- **Site → app:** o widget do site (HTML/JS puro) faz uma chamada para a rota. O CORS fica aberto (`*`), porque o
  site roda em mais de uma origem (GitHub Pages, claude.ai, arquivo local) e a rota não usa login nem cookies.
  Quem protege é o limite abaixo.
- **Anti-abuso:** como o custo é zero, o risco é só alguém gastar a cota grátis durante a apresentação.
  As proteções são: limite por IP **na memória do servidor** (15 perguntas/hora), pergunta de até 500 caracteres,
  só as últimas 6 mensagens enviadas e resposta curta. Não precisa de tabela no Supabase.
- **Proxy:** a rota `/api/assistente` sai do matcher do `src/proxy.ts`, pra não consultar o login a cada pergunta.
- **Plano B:** se a API der erro ou estourar o limite, o widget mostra botões com 6 a 8 perguntas frequentes e respostas prontas.
- **Visual:** segue as cores e fontes do site. Abre como painel no canto (tela cheia no celular), com sugestões de perguntas.

## Fica a critério de quem implementar
- Texto exato das respostas prontas e das sugestões de pergunta.
- Detalhes do visual do balão e do painel.

## Pendência do usuário
- Criar uma chave grátis em aistudio.google.com (login Google, sem cartão) e cadastrar na Vercel como
  `GEMINI_API_KEY`. A chave não deve ser colada no chat.

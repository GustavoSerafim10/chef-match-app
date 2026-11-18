# Visual "cozinha à noite" — design curto

Data: 2026-11-18. Aprovado pelo usuário ("Marcha… se conseguir seguir o padrão que te mandei, perfeito").

## Por quê
Dar o "TCHAM" no site antes da apresentação, seguindo 4 mockups enviados pelo usuário: hero com cozinha e faíscas,
bento "Quatro pilares", protótipo com halo e simulador estilo dashboard. Depois, o mesmo estilo no app.

## Objetivos
- Site inteiro escuro: fundo `#0E0D0C`, cards glassmorphism `#181614` com borda `rgba(255,107,44,0.2)`, brilhos radiais
  laranja, tipografia de alto contraste. **Textos 100% iguais** aos atuais (pedido explícito).
- Fotos geradas por IA (Canva), escurecidas: hero (cozinha à noite, chef, chamas) e fundo do protótipo (cozinha desfocada).
- Faíscas animadas leves (canvas, ~40 partículas) no hero e no protótipo.
- Pilares em bento grid (1 grande, 1 largo, 2 pequenos), ícones SVG com glow.
- Protótipo: halo laranja atrás do celular; lista lateral em cards de vidro com o ativo aceso; troca de telas continua.
- Simulador: painel de vidro; gráfico de área do **resultado acumulado em 12 meses** (começa em −R$ 3.000), reativo;
  barra de equilíbrio vermelho→verde com brilho.
- Chat "Dúvidas?" e QR seguem o novo visual.
- Depois: app com os mesmos tokens (vidro + glow).

## Não pode acontecer
- Mudar textos, quebrar a troca de telas do protótipo ou o simulador.
- Site lento nos celulares da turma: fotos em WebP ≤ ~200 KB cada, segunda foto lazy; faíscas pausam fora da tela,
  com aba oculta e com `prefers-reduced-motion`; `backdrop-filter` só nos cards.
- Texto ilegível sobre foto (sempre com overlay escuro).

## Como (minhas escolhas)
- Tudo no `chef-match/index.html` (padrão atual: um arquivo). Fotos em `chef-match/docs/img/` e referenciadas como
  `img/…`. No claude.ai, sobem junto como `files` do artifact.
- Gráfico em SVG desenhado à mão (sem biblioteca). Cálculo da série numa função pura, testável.
- Ícones 3D do mockup viram SVG com gradiente + glow (consistência e peso).

## Abordagens
- A: só luz e faíscas, sem fotos (mais leve). B (**escolhida pelo usuário**): 2 fotos de IA + luz e faíscas, mais fiel aos mockups.

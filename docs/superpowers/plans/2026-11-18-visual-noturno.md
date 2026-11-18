# Visual "cozinha à noite" — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site (e depois o app) no visual escuro dos mockups do usuário, sem mudar nenhum texto.

**Architecture:** Um novo bloco `<style id="tema-noturno">`, inserido logo após o `</style>` principal de
`chef-match/index.html` (linha 309), sobrescreve tokens e componentes. Assim o tema fica reversível e o diff fica legível.
Mudanças de HTML só onde o layout muda: bento dos pilares, camadas de foto e faíscas, gráfico do simulador.
Fotos em `chef-match/docs/img/` referenciadas como `img/…`. JS novo em `<script>` próprio no fim.

**Tech Stack:** HTML/CSS/JS puro; SVG à mão para o gráfico; `<canvas>` para as faíscas; Canva `generate-image` para as fotos; `node --test` para a função do gráfico.

**Spec:** `docs/superpowers/specs/2026-11-18-visual-noturno-design.md`

## Global Constraints

- Tokens: fundo `#0E0D0C`, vidro `#181614` (com `rgba(24,22,20,.72)` + `backdrop-filter: blur(14px)` onde houver foto atrás), borda `rgba(255,107,44,0.2)`, laranja `#F07832`, brilho `rgba(255,107,44,.35)`.
- **Nenhum texto do site muda.** Conferência: o texto extraído com `scripts/gerar-conhecimento.mjs` não pode mudar fora dos trechos de chat/QR (`git diff` do `conhecimento.ts` vazio depois de regenerar).
- Fotos WebP ≤ 200 KB cada. A segunda foto com `loading="lazy"`.
- Faíscas: no máximo 40 partículas por canvas; pausam fora da tela (IntersectionObserver), com a aba oculta e com `prefers-reduced-motion: reduce` (aí nem desenham).
- Mobile 390×844 sem rolagem horizontal; contraste de texto ≥ 4,5:1 sobre as fotos (overlay escuro).
- `docs/index.html` regenerado com o comando do README a cada task.

## Review Focus

1. Celular fraco com 30 pessoas: as fotos e o canvas não podem travar a rolagem. Verificar com throttling de CPU 4× no devtools (Task 7).
2. Texto sobre foto ilegível em telas claras ou projetor: overlay com gradiente forte (Task 2, screenshot).
3. Seções que eram brancas e tinham texto `var(--ink)` ou `var(--muted)`: nada pode ficar escuro sobre escuro. Varredura de contraste com script no devtools (Task 7).
4. Protótipo: a tela do celular continua clara e legível, e a troca de telas, o toast e as abas funcionam (Task 5).
5. Simulador: gráfico e barra atualizam com todos os controles e com "Voltar ao cenário", incluindo o caso de prejuízo (Task 6, teste + manual).

---

### Task 1: Fotos de IA

**Files:** Create `chef-match/docs/img/hero-cozinha.webp`, `chef-match/docs/img/proto-cozinha.webp`

- [ ] **Step 1:** Gerar no Canva (`generate-image`), em 16:9:
  - hero: "cozinha profissional à noite, chef de costas finalizando prato com chamas na frigideira, luz âmbar e laranja, fundo escuro, fotografia cinematográfica, desfoque leve, sem texto";
  - protótipo: "interior de cozinha de restaurante à noite muito desfocado, bokeh laranja e âmbar, tons escuros, sem pessoas em foco, sem texto".
- [ ] **Step 2:** Baixar e converter para WebP de 1600 px de largura, qualidade ~70 (`npx sharp-cli` ou `ffmpeg`, o que estiver disponível). Conferir `≤ 200 KB`.
- [ ] **Step 3:** Olhar as duas imagens (Read). Rosto, mão ou texto estranho → gerar de novo.
- [ ] **Step 4:** Commit (repo do site) `Site: fotos de cozinha para o visual noturno`.

### Task 2: Tema noturno global + hero

**Files:** Modify `chef-match/index.html`: novo `<style id="tema-noturno">` após a linha 309; HTML do hero (linhas 332–364); header.

- [ ] **Step 1:** Tokens e base: `body`, `section`, `.tint`, `.dark` → fundo `#0E0D0C`. Cada `section` ganha um brilho radial laranja sutil, alternando esquerda e direita com `:nth-of-type`. Textos `var(--ink)` → `#F6F2EE`; `var(--muted)` → `#A79D94`.
- [ ] **Step 2:** Cards claros viram vidro: `.stat`, `.mod`, `.step`, `.follow`, `.price-col`, `.split`, `.flow div`, `.swot div`, `.tbl-wrap`/`th`/`td`, `.inv article`, `.stack span`, `.tabs button`, `.tag`, `.lvl`. Regra: fundo `#181614`, borda `rgba(255,107,44,.2)`, raio `var(--r)`, sombra suave e, no hover, borda `.45` e brilho. A comanda (`.ticket`) continua clara.
- [ ] **Step 3:** Header em "pílula" de vidro como no mockup: o nav vira cápsula com borda e o fundo do header fica transparente com blur.
- [ ] **Step 4:** Hero: camada `<div class="hero-foto" aria-hidden="true">` com `background-image:url(img/hero-cozinha.webp)` + gradiente escuro da esquerda (≥ .92 sob o texto) para transparente à direita. `h1 em` com `text-shadow` laranja (brilho). `<canvas class="faiscas" aria-hidden="true">` cobrindo o hero.
- [ ] **Step 5:** Regenerar `docs/`, abrir no chrome-devtools (1280×800 e 390×844), tirar screenshots e comparar com o mockup 1.
- [ ] **Step 6:** Commit `Site: tema noturno global e hero com foto`.

### Task 3: Faíscas

**Files:** Modify `chef-match/index.html` (novo `<script>` no fim, antes do widget)

**Interfaces:** Produz `iniciarFaiscas(canvas: HTMLCanvasElement, quantidade = 40)`. Usado pelo hero (Task 2) e pelo protótipo (Task 5).

- [ ] **Step 1:** Implementar: partículas sobem com leve deriva, cor laranja/âmbar, alpha que pisca e some no topo. Usar `devicePixelRatio` limitado a 2. Redimensionar com ResizeObserver. Pausar com IntersectionObserver e `visibilitychange`. Sair cedo com `matchMedia('(prefers-reduced-motion: reduce)')`.
- [ ] **Step 2:** Verificar no devtools: animação no hero; com `prefers-reduced-motion` emulado, canvas vazio; Performance trace de 5 s com CPU 4×, sem long tasks > 50 ms causadas pelo canvas.
- [ ] **Step 3:** Commit `Site: faíscas animadas leves`.

### Task 4: Bento "Quatro pilares"

**Files:** Modify `chef-match/index.html` (CSS do `.modules` no tema e classes nos `article.mod`, linhas 417–455)

- [ ] **Step 1:** Grid desktop de 3 colunas como no mockup 2: Talentos (`.mod.b-alto`) na coluna 1 ocupando 2 linhas; Fornecedores (`.mod.b-largo`) nas colunas 2–3; Academy e Qualidade nas colunas 2 e 3 da linha de baixo; o card `.feature` em largura total. Abaixo de 760 px, 1 coluna.
- [ ] **Step 2:** Ícones: `.mod-ic` de 64 px com gradiente laranja→âmbar, `box-shadow` de brilho e um leve "3D" (inset highlight). Os SVG continuam os mesmos, só com traço mais claro.
- [ ] **Step 3:** O card grande ganha uma textura sutil: grade de pontos com `radial-gradient`, sem imagem. Os textos e as listas continuam iguais.
- [ ] **Step 4:** Verificar 1280 e 390 (screenshots); commit `Site: pilares em bento grid`.

### Task 5: Protótipo com halo

**Files:** Modify `chef-match/index.html` (seção `#app`, linhas 460–508)

- [ ] **Step 1:** Fundo: camada `.proto-foto` com `img/proto-cozinha.webp` (lazy, via `<img loading="lazy" … aria-hidden="true">` absoluto com `object-fit:cover`) + overlay. Canvas de faíscas com `iniciarFaiscas(canvas, 25)`.
- [ ] **Step 2:** Halo: `.phone` com `box-shadow` em camadas laranja (0 0 80px rgba(255,107,44,.45), 0 0 160px …) e um `::before` radial atrás. Borda do aparelho em tom bronze (`#5a3a22`→`#c9773b` gradiente).
- [ ] **Step 3:** `.screen-btn` vira card de vidro; o ativo (`aria-pressed=true`) fica com borda laranja cheia e brilho. `.explain` vira vidro com borda laranja `.45` e brilho, como "Tela em destaque" do mockup 4.
- [ ] **Step 4:** Clicar nas 7 telas (devtools) e confirmar que o conteúdo do celular troca e o toast aparece no "Contratar e avaliar"; screenshot 1280 e 390; commit `Site: protótipo com halo e cards de vidro`.

### Task 6: Simulador estilo dashboard + gráfico

**Files:**
- Modify `chef-match/index.html` (seção `#financas`, linhas 643–676; função `calc`, linha ~960)
- Create `chef-match/tests/simulador.test.mjs` (fora de `docs/`, não é publicado)

**Interfaces:** Produz `serieAcumulada(resultadoMensal: number, investimento: number, meses = 12): number[]`, com `meses + 1` pontos, onde o ponto i = `-investimento + resultadoMensal * i`. Fica no script entre os marcadores `/*serie:inicio*/` e `/*serie:fim*/`. O teste extrai o trecho com regex e avalia com `new Function`.

- [ ] **Step 1: Teste que falha** (`node --test tests/`):
  - `serieAcumulada(6452, 3000)` tem 13 pontos, `[0] === -3000`, `[1] === 3452`, `[12] === 74424`;
  - `serieAcumulada(-500, 3000)[12] === -9000`;
  - `serieAcumulada(0, 3000)` é constante em -3000.
- [ ] **Step 2:** `node --test tests/` → FAIL (marcadores não existem).
- [ ] **Step 3:** Implementar a função e o gráfico SVG (`viewBox 0 0 400 160`) dentro de `.result`, logo abaixo do `.rlines`:
  - área preenchida com gradiente laranja→transparente para a parte positiva e linha laranja com brilho (`filter: drop-shadow`);
  - linha tracejada no zero e eixo com "M0", "M6", "M12" em mono;
  - o ponto em que cruza o zero ganha um círculo aceso e o rótulo "se paga";
  - `aria-label` com o resumo (ex.: "Resultado acumulado em 12 meses: R$ 74.424").
  - `calc()` chama `desenharGrafico(serieAcumulada(res, INV))`.
- [ ] **Step 4:** Barra de equilíbrio: `.be-fill` com gradiente `#C23B2B→#F07832→#23945F` e brilho; `.be-mark` branco com glow; `.verdict` com borda e brilho na cor do estado. `.result` vira vidro com borda e cantos como no mockup 3. Sliders com trilho laranja preenchido até o valor (CSS `background` com `--p` atualizado no `calc`) e polegar com brilho.
- [ ] **Step 5:** `node --test tests/` → PASS. Manual: mover cada controle e o "Voltar ao cenário"; zerar tudo e conferir o gráfico abaixo do zero e o verdict vermelho; screenshot.
- [ ] **Step 6:** Commit `Site: simulador estilo dashboard com gráfico reativo`.

### Task 7: Acabamento, chat, QR e verificação geral

**Files:** Modify `chef-match/index.html` (widget `.ast-*`, figura do QR, fechamento e rodapé)

- [ ] **Step 1:** Painel do chat em vidro escuro (fundo `#181614`, mensagens da IA em `#221E1B` com texto claro) e balão com brilho. O QR mantém o fundo branco (necessário para leitura), dentro de um card de vidro com brilho.
- [ ] **Step 2:** Varredura de contraste no devtools: script que percorre os elementos de texto visíveis e lista os que têm contraste < 4,5 com o fundo efetivo. Corrigir todos.
- [ ] **Step 3:** Conferir textos: `node ../chef-match-app/scripts/gerar-conhecimento.mjs` e depois `git -C ../chef-match-app diff --stat src/lib/assistente/conhecimento.ts` → sem mudança.
- [ ] **Step 4:** Lighthouse mobile (performance e acessibilidade) e trace com CPU 4× rolando a página toda. Performance ≥ 70 e acessibilidade ≥ 90.
- [ ] **Step 5:** Screenshots finais 1280 e 390 de cada seção, mostrados ao usuário. Commit `Site: acabamento do visual noturno`.

### Task 8: App no mesmo estilo

**Files:** Modify `chef-match-app/src/app/globals.css` (tokens) e os componentes de card em `src/components/ui.tsx`; `src/components/assistente.tsx` (cores)

- [ ] **Step 1:** Tokens: `--color-ink: #0e0d0c`, `--color-ink-2: #181614`, borda `rgba(255,107,44,.2)` como `--color-line` e brilho laranja como utilitário `.glow`. Fundo do `body` com o mesmo brilho radial sutil do site.
- [ ] **Step 2:** Cards (`ui.tsx`) com vidro, borda laranja translúcida e hover com brilho; botão laranja com `box-shadow` de brilho; header e barra inferior com blur.
- [ ] **Step 3:** `npm test`, `npm run lint` e `npm run build` OK; `next start` + devtools em `/entrar` e `/painel` (demo restaurante), 390×844 e 1280; screenshots ao usuário.
- [ ] **Step 4:** Commit `App: visual noturno com vidro e brilho`.

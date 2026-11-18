// Gera src/lib/assistente/conhecimento.ts a partir do site e do roteiro.
// Rode de novo sempre que o site mudar: node scripts/gerar-conhecimento.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const raiz = (p) => fileURLToPath(new URL(p, import.meta.url));

const entidades = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ", "&middot;": "·" };

function textoDoSite(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<\/(p|h[1-6]|li|section|div|tr|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => entidades[e] ?? " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

const site = textoDoSite(readFileSync(raiz("../../chef-match/index.html"), "utf8"));
const roteiro = readFileSync(raiz("../../chef-match/ROTEIRO.md"), "utf8").trim();

const conteudo = `# Texto do site do Chef's Match\n${site}\n\n# Roteiro da apresentação\n${roteiro}`;
const escapado = conteudo.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

writeFileSync(
  raiz("../src/lib/assistente/conhecimento.ts"),
  `// Arquivo gerado por scripts/gerar-conhecimento.mjs. Não edite à mão.\nexport const CONHECIMENTO = \`${escapado}\`;\n`,
);
console.log(`conhecimento.ts gerado: ${conteudo.length} caracteres`);

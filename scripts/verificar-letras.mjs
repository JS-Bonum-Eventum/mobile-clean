// Uso (na raiz do projeto): node verificar-letras.mjs caminho/do/PlanoDevocional.tsx
// Baixa Salmos, Provérbios e Lamentações (ARA) e aplica a MESMA limpeza do app.
import { readFileSync } from "node:fs";

const arquivo = process.argv[2] ?? "PlanoDevocional.tsx";
const src = readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n");
const ini = src.indexOf("const ACROSTICO_LIVROS");
const fim = src.indexOf("// ── Referência", ini);
if (ini < 0 || fim < 0 || !src.includes("const ACROSTICO_LETRAS = new Set")) {
  console.log(`FAIL: ${arquivo} não tem a limpeza nova. Substitua o arquivo.`);
  process.exitCode = 1;
} else {
  const js = src.slice(ini, fim).replace("(bookId: number, text: string): string", "(bookId, text)");
  const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const cleanVerse = new Function("removeAccents", js + "return cleanVerse;")(semAcento);

  const removidas = new Map();
  const suspeitos = [];
  try {
    for (const [id, nome, caps] of [[19, "Salmos", 150], [20, "Provérbios", 31], [25, "Lamentações", 5]]) {
      console.log(`Lendo ${nome}...`);
      for (let c = 1; c <= caps; c++) {
        const r = await fetch(`https://bolls.life/get-text/ARA/${id}/${c}/`, { signal: AbortSignal.timeout(15000) });
        if (!r.ok) throw new Error(`HTTP ${r.status} em ${nome} ${c}`);
        const versos = await r.json();
        if (!Array.isArray(versos) || !versos.length) throw new Error(`resposta vazia em ${nome} ${c}`);
        for (const v of versos) {
          const antes = v.text.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
          const depois = cleanVerse(id, v.text);
          const primeira = antes.split(/[\s.]/)[0];
          if (depois !== antes) removidas.set(primeira, (removidas.get(primeira) ?? 0) + 1);
          // Sobrou algo com cara de letra: uma palavra isolada no começo, antes de . : - ou nova frase
          else if (/^[\[(]?\p{Lu}\p{Ll}{0,8}[\])]?\s*[.:–—-]/u.test(antes) || /<(b|i|S|sup|h\d)\b/i.test(v.text))
            suspeitos.push(`${nome} ${c},${v.verse}: ${v.text.slice(0, 60)}`);
        }
      }
    }
    console.log("\nRemovidas:", [...removidas].map(([k, n]) => `${k}(${n})`).join(" ") || "nenhuma");
    console.log(`\nPara conferir (${suspeitos.length}):\n${suspeitos.join("\n")}`);
  } catch (e) {
    console.log("ERRO:", e.message);
    process.exitCode = 1;
  }
}

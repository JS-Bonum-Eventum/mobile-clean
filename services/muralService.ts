// ─────────────────────────────────────────────────────────────────
//  services/muralService.ts
//
//  Lê dados do Google Sheets (publicado como CSV) e retorna
//  os itens de cada categoria do Mural.
//
//  COLUNAS ESPERADAS EM CADA ABA (linha 1 = cabeçalho):
//  titulo | subtitulo | descricao | contato | extra | imagem | data | local | ativo | patrocinado | prioridade | destaque | linkExterno
// ─────────────────────────────────────────────────────────────────

export type MuralItem = {
  titulo:       string;   // Nome/título principal          (obrigatório)
  subtitulo:    string;   // Linha resumo exibida na lista
  descricao:    string;   // Texto completo no detalhe
  contato:      string;   // Tel, e-mail, @instagram ou URL
  extra:        string;   // Campo livre (horário, preço…)
  imagem:       string;   // URL pública da imagem
  data:         string;   // Data do evento / validade
  local:        string;   // Endereço ou cidade
  ativo:        boolean;  // true = exibe | false = oculta

  // ── Campos de monetização (novas colunas na planilha) ──────────
  patrocinado?: boolean;  // true = exibe badge + ordenação prioritária
  prioridade?:  number;   // 0–10, quanto maior mais acima na lista
  destaque?:    boolean;  // true = card com visual diferenciado
  linkExterno?: string;   // URL para botão "Saiba mais"
};

export type MuralCategoria =
  | "Eventos"
  | "Bandas"
  | "Shows"
  | "Serviços"
  | "Indicações"
  | "Produtos Religiosos"
  | "Comunidade"
  | "Apoiadores Parceiros";

// ── Cole o ID da sua planilha aqui ───────────────────────────────
const SHEET_ID = "1WiUN_IKgRgzVK9cFLELXg_zj_82A_IPDwhIdwHxHhvI";

const SHEET_TAB: Record<MuralCategoria, string> = {
  "Eventos":              "Eventos",
  "Bandas":               "Bandas",
  "Shows":                "Shows",
  "Serviços":             "Servicos",
  "Indicações":           "Indicacoes",
  "Produtos Religiosos":  "Produtos",
  "Comunidade":           "Comunidade",
  "Apoiadores Parceiros": "Apoiadores",
};

function sheetUrl(categoria: MuralCategoria) {
  const tab = encodeURIComponent(SHEET_TAB[categoria]);
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${tab}`;
}

// ── Cache em memória (5 minutos) ──────────────────────────────────
const cache: Partial<Record<MuralCategoria, { data: MuralItem[]; ts: number }>> = {};
const CACHE_TTL_MS = 5 * 60 * 1000;

// ── Parser CSV ────────────────────────────────────────────────────
// ✅ Processa o texto completo caractere a caractere, respeitando
//    células com quebras de linha internas (Alt+Enter no Sheets).
function parseCSV(raw: string): string[][] {
  const rows: string[][] = [];
  let cols: string[] = [];
  let cur = "";
  let inQuotes = false;
  const text = raw.trim();

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        // Aspas duplas escapadas dentro de campo → adiciona uma aspa
        cur += '"';
        i++;
      } else {
        // Abre ou fecha o modo "dentro de aspas"
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      // Separador de coluna
      cols.push(cur.trim());
      cur = "";
    } else if ((ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) && !inQuotes) {
      // Quebra de linha FORA de aspas = fim de registro
      if (ch === "\r") i++; // consome o \n do \r\n
      cols.push(cur.trim());
      rows.push(cols);
      cols = [];
      cur = "";
    } else if (ch === "\r" && !inQuotes) {
      // \r sozinho (Mac-style) = fim de registro
      cols.push(cur.trim());
      rows.push(cols);
      cols = [];
      cur = "";
    } else {
      // ✅ Qualquer outro char — inclusive \n DENTRO de aspas (Alt+Enter)
      //    é preservado como parte do conteúdo da célula
      cur += ch;
    }
  }

  // Último campo/registro sem \n final
  if (cur.length > 0 || cols.length > 0) {
    cols.push(cur.trim());
    rows.push(cols);
  }

  return rows;
}

// ── Fetch principal ───────────────────────────────────────────────
export async function fetchMuralItems(
  categoria: MuralCategoria,
  forceRefresh = false,
): Promise<MuralItem[]> {
  const now    = Date.now();
  const cached = cache[categoria];

  if (!forceRefresh && cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  if (SHEET_ID === "SEU_ID_AQUI") return [];

  try {
    const res = await fetch(sheetUrl(categoria));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = parseCSV(await res.text());

    // Colunas: titulo | subtitulo | descricao | contato | extra | imagem | data | local | ativo
    //          [0]      [1]          [2]         [3]       [4]    [5]      [6]    [7]     [8]
    // Novas:   patrocinado | prioridade | destaque | linkExterno
    //          [9]           [10]         [11]        [12]
    const items: MuralItem[] = rows
      .slice(1)
      .filter((r) => r.length >= 9)
      .map((r) => ({
        titulo:       (r[0]  ?? "").replace(/\\n/g, "\n").trim(),
        subtitulo:    (r[1]  ?? "").replace(/\\n/g, "\n").trim(),
        descricao:    (r[2]  ?? "").replace(/\\n/g, "\n").trim(),
        contato:      (r[3]  ?? "").replace(/\\n/g, "\n").trim(),
        extra:        (r[4]  ?? "").replace(/\\n/g, "\n").trim(),
        imagem:       r[5]  ?? "",
        data:         r[6]  ?? "",
        local:        r[7]  ?? "",
        ativo:        r[8]?.toLowerCase()  === "true",
        patrocinado:  r[9]?.toLowerCase()  === "true",
        prioridade:   r[10] ? Number(r[10]) : 0,
        destaque:     r[11]?.toLowerCase() === "true",
        linkExterno:  r[12] ?? "",
      }))
      // Filtra apenas ativos com título
      .filter((item) => item.ativo && item.titulo !== "");

    cache[categoria] = { data: items, ts: now };
    return items;
  } catch (err) {
    console.warn(`[muralService] Erro ao buscar ${categoria}:`, err);
    return cached?.data ?? [];
  }
}

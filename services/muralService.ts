// ─────────────────────────────────────────────────────────────────
//  services/muralService.ts
//
//  Lê dados do Google Sheets (publicado como CSV) e retorna
//  os itens de cada categoria do Mural.
//
//  CONFIGURAÇÃO:
//  Substitua SEU_ID_AQUI pelo ID real da sua planilha.
//  O ID está na URL do Sheets:
//  https://docs.google.com/spreadsheets/d/ ➜ SEU_ID_AQUI ➜ /edit
//
//  COLUNAS ESPERADAS EM CADA ABA (linha 1 = cabeçalho):
//  titulo | subtitulo | descricao | contato | extra | imagem | data | local | ativo
// ─────────────────────────────────────────────────────────────────

export type MuralItem = {
  titulo:    string;   // Nome/título principal          (obrigatório)
  subtitulo: string;   // Linha resumo exibida na lista  (ex: cidade, categoria)
  descricao: string;   // Texto completo no detalhe
  contato:   string;   // Tel, e-mail, @instagram ou URL
  extra:     string;   // Campo livre (horário, preço…)
  imagem:    string;   // URL pública da imagem (Drive, Imgur, GitHub…)
  data:      string;   // Data do evento / validade      (ex: 25/12/2025)
  local:     string;   // Endereço ou cidade
  ativo:     boolean;  // true = exibe | false = oculta sem deletar
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

// Nome de cada aba na planilha (sem acentos para evitar erros de URL)
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

// ── Parser CSV (lida com campos entre aspas e vírgulas internas) ──
function parseCSV(raw: string): string[][] {
  const lines = raw.trim().split("\n");
  return lines.map((line) => {
    const cols: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cols.push(cur.trim()); cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    return cols;
  });
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

  if (SHEET_ID === "SEU_ID_AQUI") return []; // ainda não configurado

  try {
    const res = await fetch(sheetUrl(categoria));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = parseCSV(await res.text());

    // Linha 0 = cabeçalho → ignora
    // Colunas: titulo | subtitulo | descricao | contato | extra | imagem | data | local | ativo
    const items: MuralItem[] = rows
      .slice(1)
      .filter((r) => r.length >= 9)
      .map((r) => ({
        titulo:    r[0] ?? "",
        subtitulo: r[1] ?? "",
        descricao: r[2] ?? "",
        contato:   r[3] ?? "",
        extra:     r[4] ?? "",
        imagem:    r[5] ?? "",
        data:      r[6] ?? "",
        local:     r[7] ?? "",
        ativo:     r[8]?.toLowerCase() === "true",
      }))
      .filter((item) => item.ativo && item.titulo !== "");

    cache[categoria] = { data: items, ts: now };
    return items;
  } catch (err) {
    console.warn(`[muralService] Erro ao buscar ${categoria}:`, err);
    return cached?.data ?? [];
  }
}

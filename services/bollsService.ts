// Busca de capítulos no bolls.life (ARA) com nova tentativa e cache.
// O texto bíblico não muda, então um capítulo já lido não precisa ir à rede de novo.
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BollsVerse { pk: number; verse: number; text: string }

const BASE = "https://bolls.life/get-text/ARA";
const TIMEOUTS_MS = [8000, 12000]; // 1ª e 2ª tentativa
const PAUSA_MS = 1000;
const PREFIXO = "bolls_ARA_";
const INDICE = "bolls_ARA_indice";
const MAX_SALVOS = 100; // limita o espaço usado no aparelho

const memoria = new Map<string, BollsVerse[]>();

// O limite de tempo cobre a conexão E a leitura do corpo da resposta.
async function baixar(url: string, ms: number): Promise<BollsVerse[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("resposta inválida");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function ler(chave: string): Promise<BollsVerse[] | null> {
  try {
    const salvo = await AsyncStorage.getItem(chave);
    const data = salvo ? JSON.parse(salvo) : null;
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

// Gravações em fila, para o índice não se perder com buscas simultâneas.
let fila: Promise<void> = Promise.resolve();
function salvar(chave: string, data: BollsVerse[]): void {
  fila = fila.then(async () => {
    try {
      const indice: string[] = JSON.parse((await AsyncStorage.getItem(INDICE)) ?? "[]");
      const novo = [...indice.filter((k) => k !== chave), chave];
      while (novo.length > MAX_SALVOS) await AsyncStorage.removeItem(novo.shift()!);
      await AsyncStorage.setItem(chave, JSON.stringify(data));
      await AsyncStorage.setItem(INDICE, JSON.stringify(novo));
    } catch {} // sem espaço ou erro de leitura: o app segue sem salvar
  });
}

// Retorna [] se o capítulo não existe; lança erro se o serviço falhar.
export async function getCapituloARA(bookId: number, chapter: number | string): Promise<BollsVerse[]> {
  const chave = `${PREFIXO}${bookId}_${Number(chapter)}`;
  const emMemoria = memoria.get(chave);
  if (emMemoria) return emMemoria;
  const emDisco = await ler(chave);
  if (emDisco) { memoria.set(chave, emDisco); return emDisco; }

  let ultimoErro: unknown;
  for (let i = 0; i < TIMEOUTS_MS.length; i++) {
    try {
      const data = await baixar(`${BASE}/${bookId}/${Number(chapter)}/`, TIMEOUTS_MS[i]);
      if (data.length > 0) { memoria.set(chave, data); salvar(chave, data); }
      return data;
    } catch (e: any) {
      ultimoErro = e;
      // Erro 4xx (exceto 408 e 429) não melhora repetindo
      if (e?.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) break;
      if (i < TIMEOUTS_MS.length - 1) await new Promise((r) => setTimeout(r, PAUSA_MS));
    }
  }
  throw ultimoErro;
}

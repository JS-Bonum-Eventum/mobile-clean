import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIMARY_API = "https://liturgia.up.railway.app/v2/";
const FALLBACK_API      = "https://api-liturgia-diaria.vercel.app/cn"; // ✅ /cn usa fonte Canção Nova
const ACLAMACAO_API     = "https://api-liturgia-diaria.vercel.app/";   // ✅ fallback só para aclamação
const CACHE_PREFIX = "liturgia_v2_";

export interface LeituraItem {
  referencia: string;
  titulo?: string;
  texto: string;
  refrao?: string;
}

export interface AclamacaoEvangelho {
  refrao?: string;
  versiculo?: string;
}

export interface LiturgyData {
  data: string;
  liturgia: string;
  cor: string;
  oracaodia?: string;
  primeiraLeitura?: LeituraItem;
  segundaLeitura?: LeituraItem;
  salmo?: LeituraItem;
  evangelho?: LeituraItem;
  aclamacaoEvangelho?: AclamacaoEvangelho; // ✅ campo único
  isOffline?: boolean;
  offlineMessage?: string;
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCacheKey(date: string): string {
  return `${CACHE_PREFIX}${date}`;
}

async function getCached(date: string): Promise<LiturgyData | null> {
  try {
    const cached = await AsyncStorage.getItem(getCacheKey(date));
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }
  return null;
}

async function setCache(date: string, data: LiturgyData): Promise<void> {
  try {
    await AsyncStorage.setItem(getCacheKey(date), JSON.stringify(data));
  } catch {
    // ignore
  }
}

// The real API returns arrays for all reading fields
// e.g. leituras.primeiraLeitura = [{ referencia, titulo, texto }]
// e.g. leituras.salmo = [{ referencia, refrao, texto }]
// e.g. oracoes.coleta = string (daily prayer)
function normalizeLiturgyData(raw: Record<string, unknown>): LiturgyData {
  const leituras = (raw.leituras ?? {}) as Record<string, unknown>;
  const oracoes = (raw.oracoes ?? {}) as Record<string, unknown>;

  function firstOf(arr: unknown): LeituraItem | undefined {
    if (Array.isArray(arr) && arr.length > 0) {
      return arr[0] as LeituraItem;
    }
    if (arr && typeof arr === "object" && !Array.isArray(arr)) {
      return arr as LeituraItem;
    }
    return undefined;
  }

  const primeiraLeitura = firstOf(leituras.primeiraLeitura);
  const segundaLeitura = firstOf(leituras.segundaLeitura);
  const salmo = firstOf(leituras.salmo);
  const evangelho = firstOf(leituras.evangelho);

  // Use coleta as the daily prayer, fall back to top-level oracaodia
  const oracaodia =
    (oracoes.coleta as string) ||
    (raw.oracaodia as string) ||
    undefined;

  return {
    data: (raw.data as string) || getTodayString(),
    liturgia: (raw.liturgia as string) || "",
    cor: (raw.cor as string) || "verde",
    oracaodia,
    primeiraLeitura,
    segundaLeitura,
    salmo,
    evangelho,
  };
}

// ✅ Normaliza dados do endpoint /cn (fonte: Canção Nova)
// Diferenças vs endpoint / :
//   gospel.head = versículo aclamação | gospel.head_response = título evangelho
//   psalm.content_psalm[0] = usado como refrão
//   second_reading disponível
function normalizeFallbackData(raw: Record<string, unknown>): LiturgyData {
  const today         = (raw.today ?? {}) as Record<string, unknown>;
  const readings      = (today.readings ?? {}) as Record<string, unknown>;
  const gospel        = (readings.gospel         ?? {}) as Record<string, unknown>;
  const firstReading  = (readings.first_reading  ?? {}) as Record<string, unknown>;
  const secondReading = (readings.second_reading ?? {}) as Record<string, unknown>;
  const psalm         = (readings.psalm          ?? {}) as Record<string, unknown>;

  // /cn: psalm.response = "Responsório Sl..." — usa content_psalm[0] como refrão
  const psalmArr    = Array.isArray(psalm.content_psalm) ? (psalm.content_psalm as string[]) : [];
  const psalmRefrao = psalmArr.length > 0 ? psalmArr[0] : (psalm.response as string) || "";
  const psalmTexto  = psalmArr.length > 1 ? psalmArr.slice(1).join("\n") : (psalm.response as string) || "";

  return {
    data:     (today.date as string) || getTodayString(),
    liturgia: (today.entry_title as string)?.replace(/<[^>]*>/g, "") || "",
    cor:      (today.color as string) || "verde",

    primeiraLeitura: firstReading.text ? {
      referencia: (firstReading.head as string) || "",
      titulo:     (firstReading.head as string) || "",
      texto:      firstReading.text as string,
    } : undefined,

    segundaLeitura: secondReading.text ? {
      referencia: (secondReading.head as string) || "",
      titulo:     (secondReading.head as string) || "",
      texto:      secondReading.text as string,
    } : undefined,

    salmo: psalm.content_psalm ? {
      referencia: (psalm.title as string) || "",
      refrao:     psalmRefrao,
      texto:      psalmTexto,
    } : undefined,

    evangelho: gospel.text ? {
      referencia: (gospel.head_response as string) || "",
      titulo:     (gospel.head_response as string) || "",
      texto:      gospel.text as string,
    } : undefined,

    // /cn: gospel.head = versículo da aclamação | aleluia fixo pois não vem explícito
    aclamacaoEvangelho: gospel.head ? {
      refrao:    "Aleluia, Aleluia, Aleluia.",
      versiculo: (gospel.head as string) || undefined,
    } : undefined,
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromApi(url: string): Promise<LiturgyData> {
  const response = await fetchWithTimeout(url, 10000);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const raw = await response.json();
  return normalizeLiturgyData(raw as Record<string, unknown>);
}

const MOCK_DATA: LiturgyData = {
  data: getTodayString(),
  liturgia: "Feria — Tempo Comum",
  cor: "Verde",
  oracaodia:
    "Senhor, guia nossos passos e ilumina nosso caminho com a luz do Evangelho. Que a tua graça esteja conosco neste dia. Amém.",
  primeiraLeitura: {
    referencia: "Jr 20,10-13",
    titulo: "Leitura do Livro do profeta Jeremias",
    texto:
      "O Senhor está ao meu lado como forte guerreiro; por isso, os que me perseguem cairão vencidos. Por não terem tido êxito, eles se cobrirão de vergonha. Cantai ao Senhor, louvai o Senhor, pois ele salvou a vida de um pobre homem das mãos dos maus.",
  },
  salmo: {
    referencia: "Sl 17(18)",
    refrao: "Ao Senhor eu invoquei na minha angústia, e ele escutou a minha voz.",
    texto:
      "Eu vos amo, ó Senhor! Sois minha força, minha rocha, meu refúgio e salvador!\nÓ meu Deus, sois o rochedo que me abriga, minha força e poderosa salvação, sois meu escudo e proteção: em vós espero!\nAo Senhor eu invoquei na minha angústia e elevei o meu clamor para o meu Deus.",
  },
  evangelho: {
    referencia: "Jo 10,31-42",
    titulo: "Proclamação do Evangelho de Jesus Cristo segundo João",
    texto:
      "Naquele tempo, os judeus pegaram pedras para apedrejar Jesus. E ele lhes disse: \"Por ordem do Pai, mostrei-vos muitas obras boas. Por qual delas me quereis apedrejar?\" Os judeus responderam: \"Não queremos te apedrejar por causa das obras boas, mas por causa de blasfêmia, porque, sendo apenas um homem, tu te fazes Deus!\"",
  },
  isOffline: true,
  offlineMessage: "Conteúdo offline exibido",
};

export async function fetchLiturgy(date?: string): Promise<LiturgyData> {
  const targetDate = date || getTodayString();

  const cached = await getCached(targetDate);
  if (cached) {
    return cached;
  }

  try {
    // ✅ Busca Primary e /cn em paralelo
    const [primaryResult, cnResult] = await Promise.allSettled([
      fetchFromApi(`${PRIMARY_API}?date=${targetDate}`),
      (async () => {
        const response = await fetchWithTimeout(FALLBACK_API, 10000);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        return normalizeFallbackData(raw as Record<string, unknown>);
      })(),
    ]);

    if (primaryResult.status === "fulfilled") {
      const data = primaryResult.value;

      if (cnResult.status === "fulfilled") {
        // ✅ /cn OK — pega aclamação dela
        data.aclamacaoEvangelho = cnResult.value.aclamacaoEvangelho;
      } else {
        // ✅ /cn falhou — tenta aclamação da / como fallback
        try {
          const response = await fetchWithTimeout(ACLAMACAO_API, 6000);
          if (response.ok) {
            const raw = await response.json();
            const fallback = normalizeFallbackData(raw as Record<string, unknown>);
            if (fallback.aclamacaoEvangelho) {
              data.aclamacaoEvangelho = fallback.aclamacaoEvangelho;
            }
          }
        } catch {
          // aclamação indisponível — Primary segue sem ela
        }
      }

      await setCache(targetDate, data);
      return data;
    }

    // Primary falhou — tenta /cn completa
    if (cnResult.status === "fulfilled") {
      const data = cnResult.value;
      await setCache(targetDate, data);
      return data;
    }

    // /cn também falhou — todas as APIs falharam, usa MOCK_DATA
  } catch {
    // use mock data
  }

  return MOCK_DATA;
}

export function getTodayDate(): string {
  return getTodayString();
}

export const CATHOLIC_PHRASES = [
  "Com Deus, tudo. Sem Deus, nada.",
  "A oração é a respiração da alma.",
  "Deus nunca abandona quem nele confia.",
  "Pequenas obras com grande amor fazem grandes obras.",
  "A fé remove montanhas — e coloca em nosso coração a paz.",
  "Senhor, não o que eu quero, mas o que Tu queres.",
  "O amor é paciente, é bondoso; o amor não é invejoso.",
  "Tudo posso naquele que me fortalece.",
  "A misericórdia de Deus é maior que todos os nossos pecados.",
  "Quem tem a Deus, nada lhe falta.",
  "Vinde a mim todos os que estais cansados — diz o Senhor.",
  "A paz de Deus que ultrapassa todo o entendimento.",
];

export const BIBLE_VERSES = [
  { verse: "Salmo 23,1", text: "O Senhor é o meu pastor; nada me faltará." },
  {
    verse: "Filipenses 4,13",
    text: "Tudo posso naquele que me fortalece.",
  },
  {
    verse: "João 3,16",
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.",
  },
  {
    verse: "Jeremias 29,11",
    text: "Porque sei os planos que tenho para vocês, planos de prosperar e não de causar dano.",
  },
  {
    verse: "Mateus 6,33",
    text: "Buscai primeiro o Reino de Deus e a sua justiça, e todas essas coisas vos serão acrescentadas.",
  },
  {
    verse: "Salmo 46,1",
    text: "Deus é o nosso refúgio e força, socorro bem presente na angústia.",
  },
  {
    verse: "Provérbios 3,5-6",
    text: "Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.",
  },
  {
    verse: "Romanos 8,28",
    text: "Sabemos que todas as coisas contribuem para o bem daqueles que amam a Deus.",
  },
  {
    verse: "Isaías 40,31",
    text: "Mas os que esperam no Senhor renovarão as suas forças.",
  },
  {
    verse: "1 Coríntios 13,13",
    text: "Agora, pois, permanecem a fé, a esperança e o amor — estes três — mas o maior deles é o amor.",
  },
];

export function getDailyPhrase(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  return CATHOLIC_PHRASES[dayOfYear % CATHOLIC_PHRASES.length];
}

export function getDailyVerse(): { verse: string; text: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  return BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length];
}

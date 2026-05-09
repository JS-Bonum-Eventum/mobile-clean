import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Share,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLiturgy } from "@/context/LiturgyContext";
import Colors from "@/constants/colors";
import { useSettings } from "@/context/SettingsContext";
import { BIBLE_VERSES } from "@/services/liturgiaService";

const NOT_FOUND_MSG = "Não foi possível encontrar a passagem informada.";

// ── APIs ──────────────────────────────────────────────────────────
// Primary: bible-api.com (Almeida) + bolls.life (Salmos/Provérbios)
// Fallback: ABíbliaDigital (NVI) com token — usado se Primary falhar
const ABD_BASE    = "https://www.abibliadigital.com.br/api";
const ABD_TOKEN   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJTYXQgTWF5IDA5IDIwMjYgMjA6Mzg6MTUgR01UKzAwMDAuanNib251bS5ldmVudHVtQGdtYWlsLmNvbSIsImlhdCI6MTc3ODM1OTA5NX0.6zPWLRIpL1-ZQBbar2OWdXP30qHpntc7ELsjJAnmxGg";
const ABD_VERSION = "nvi";

// ── Primary: bible-api.com ────────────────────────────────────────
async function fetchBiblePassagePrimary(reference: string): Promise<string> {
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=almeida`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(NOT_FOUND_MSG);
  const data = await response.json();
  if (data.error) throw new Error(NOT_FOUND_MSG);
  if (data.verses && data.verses.length > 0)
    return data.verses.map((v: any) => `${v.book_name} ${v.chapter},${v.verse}\n${v.text.trim()}`).join("\n\n");
  if (data.text && data.text.trim().length > 0) return data.text.trim();
  throw new Error(NOT_FOUND_MSG);
}

// ── Primary: bolls.life (Salmos e Provérbios) ─────────────────────
async function fetchBollsPassagePrimary(
  bookNum: number, bookLabel: string, chapter: string, from: string, to: string
): Promise<string> {
  const cap = chapter.trim();
  if (!cap) throw new Error(NOT_FOUND_MSG);
  const response = await fetch(`https://bolls.life/get-text/ARA/${bookNum}/${cap}/`);
  if (!response.ok) throw new Error(NOT_FOUND_MSG);
  const data: Array<{ pk: number; verse: number; text: string }> = await response.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error(NOT_FOUND_MSG);
  let verses = data;
  if (from.trim()) {
    const fn = parseInt(from.trim(), 10);
    const tn = to.trim() ? parseInt(to.trim(), 10) : null;
    verses = data.filter((v) => tn !== null ? v.verse >= fn && v.verse <= tn : v.verse >= fn);
  }
  if (verses.length === 0) throw new Error(NOT_FOUND_MSG);
  return `${bookLabel} ${cap}\n\n${verses.map((v) => `${v.verse}. ${v.text.trim()}`).join("\n\n")}`;
}

// ---------------------------------------------------------------------------
// Dicionário de slugs — ABíbliaDigital (versão APEE, cânon católico completo)
// Cobre variações comuns sem acento, abreviações e maiúsculas/minúsculas.
// Normalização: toLowerCase() + removeAccents() antes de lookup.
// ---------------------------------------------------------------------------
function removeAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const BOOK_SLUG: Record<string, string> = {
  // Pentateuco
  genesis: "gn", genese: "gn", gn: "gn",
  exodo: "ex", exodus: "ex", ex: "ex",
  levitico: "lv", lv: "lv",
  numeros: "nm", nm: "nm",
  deuteronomio: "dt", dt: "dt",
  // Históricos
  josue: "js", js: "js",
  juizes: "jz", jz: "jz",
  rute: "rt", rt: "rt",
  "1samuel": "1sm", "1 samuel": "1sm", "i samuel": "1sm", "1sm": "1sm",
  "2samuel": "2sm", "2 samuel": "2sm", "ii samuel": "2sm", "2sm": "2sm",
  "1reis": "1rs", "1 reis": "1rs", "i reis": "1rs", "1rs": "1rs",
  "2reis": "2rs", "2 reis": "2rs", "ii reis": "2rs", "2rs": "2rs",
  "1cronicas": "1cr", "1 cronicas": "1cr", "i cronicas": "1cr", "1cr": "1cr",
  "2cronicas": "2cr", "2 cronicas": "2cr", "ii cronicas": "2cr", "2cr": "2cr",
  esdras: "ed", ed: "ed",
  neemias: "ne", ne: "ne",
  tobias: "tb", tb: "tb",
  judite: "jt", jt: "jt",
  ester: "et", et: "et",
  "1macabeus": "1mc", "1 macabeus": "1mc", "i macabeus": "1mc", "1mc": "1mc",
  "2macabeus": "2mc", "2 macabeus": "2mc", "ii macabeus": "2mc", "2mc": "2mc",
  // Sapienciais
  jo: "jó", job: "jó", jó: "jó",
  salmos: "sl", salmo: "sl", sl: "sl",
  proverbios: "pv", proverbio: "pv", pv: "pv",
  eclesiastes: "ec", ec: "ec",
  "cantico dos canticos": "ct", "canticos": "ct", ct: "ct",
  sabedoria: "sb", sb: "sb",
  eclesiastico: "si", siracida: "si", si: "si",
  // Profetas Maiores
  isaias: "is", is: "is",
  jeremias: "jr", jr: "jr",
  lamentacoes: "lm", lamentações: "lm", lm: "lm",
  baruc: "br", br: "br",
  ezequiel: "ez", ez: "ez",
  daniel: "dn", dn: "dn",
  // Profetas Menores
  oseias: "os", os: "os",
  joel: "jl", jl: "jl",
  amos: "am", am: "am",
  abdias: "ob", ob: "ob",
  jonas: "jn", // cuidado: "jn" é compartilhado com João — resolvido abaixo
  miqueias: "mq", mq: "mq",
  naum: "na", na: "na",
  habacuc: "hc", hc: "hc",
  sofonias: "sf", sf: "sf",
  ageu: "ag", ag: "ag",
  zacarias: "zc", zc: "zc",
  malaquias: "ml", ml: "ml",
  // Novo Testamento
  mateus: "mt", mt: "mt",
  marcos: "mc", // mc já mapeado para 2macabeus — aqui sobrescreve quando não tem número
  lucas: "lc", lc: "lc",
  joao: "jo", joão: "jo",
  "atos dos apostolos": "at", atos: "at", at: "at",
  romanos: "rm", rm: "rm",
  "1corintios": "1co", "1 corintios": "1co", "i corintios": "1co", "1co": "1co",
  "2corintios": "2co", "2 corintios": "2co", "ii corintios": "2co", "2co": "2co",
  galatas: "gl", gl: "gl",
  efesios: "ef", ef: "ef",
  filipenses: "fp", fp: "fp",
  colossenses: "cl", cl: "cl",
  "1tessalonicenses": "1ts", "1 tessalonicenses": "1ts", "1ts": "1ts",
  "2tessalonicenses": "2ts", "2 tessalonicenses": "2ts", "2ts": "2ts",
  "1timoteo": "1tm", "1 timoteo": "1tm", "1tm": "1tm",
  "2timoteo": "2tm", "2 timoteo": "2tm", "2tm": "2tm",
  tito: "tt", tt: "tt",
  filemon: "fm", fm: "fm",
  hebreus: "hb", hb: "hb",
  tiago: "tg", tg: "tg",
  "1pedro": "1pe", "1 pedro": "1pe", "1pe": "1pe",
  "2pedro": "2pe", "2 pedro": "2pe", "2pe": "2pe",
  "1joao": "1jo", "1 joao": "1jo", "1 joão": "1jo", "1jo": "1jo",
  "2joao": "2jo", "2 joao": "2jo", "2 joão": "2jo", "2jo": "2jo",
  "3joao": "3jo", "3 joao": "3jo", "3 joão": "3jo", "3jo": "3jo",
  judas: "jd", jd: "jd",
  apocalipse: "ap", ap: "ap",
};

function resolveBookSlug(raw: string): string | null {
  const normalized = removeAccents(raw.trim().toLowerCase());
  return BOOK_SLUG[normalized] ?? null;
}

// ---------------------------------------------------------------------------
// Fetch único — ABíbliaDigital APEE
// Endpoint: GET /verses/:version/:abbrev/:chapter → retorna capítulo inteiro
// com array "verses". Filtramos o range desejado no cliente.
// ---------------------------------------------------------------------------
const ABD_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJTYXQgTWF5IDA5IDIwMjYgMjA6Mzg6MTUgR01UKzAwMDAuanNib251bS5ldmVudHVtQGdtYWlsLmNvbSIsImlhdCI6MTc3ODM1OTA5NX0.6zPWLRIpL1-ZQBbar2OWdXP30qHpntc7ELsjJAnmxGg";
const ABD_VERSION = "nvi"; // ✅ Versão em português — token autenticado

// ── Fallback: ABíbliaDigital com token ───────────────────────────
async function fetchABDFallback(
  slug: string,
  chapter: number,
  from: number,
  to: number,
  bookLabel: string
): Promise<string> {
  const url = `${ABD_BASE}/verses/${ABD_VERSION}/${slug}/${chapter}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${ABD_TOKEN}` },
  });
  if (!res.ok) throw new Error(NOT_FOUND_MSG);
  const data = await res.json();

  // A API retorna { verses: [{ number, text }, ...] }
  if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
    throw new Error(NOT_FOUND_MSG);
  }

  // Filtra pelo range solicitado (number = número do versículo)
  const filtered = data.verses.filter(
    (v: { number: number; text: string }) => v.number >= from && v.number <= to
  );
  if (filtered.length === 0) throw new Error(NOT_FOUND_MSG);

  const header = `${bookLabel} ${chapter}`;
  const body = filtered
    .map((v: { number: number; text: string }) => `${v.number}. ${v.text.trim()}`)
    .join("\n\n");
  return `${header}\n\n${body}`;
}

// ---------------------------------------------------------------------------
// Estado de busca
// ---------------------------------------------------------------------------
interface SearchState {
  loading: boolean;
  result: string | null;
  error: string | null;
}

const emptySearch: SearchState = { loading: false, result: null, error: null };

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export default function BibliaScreen() {
  const { dailyVerse } = useLiturgy();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "ios" ? insets.top : 0;

  // Painel: Livro
  const [livro, setLivro] = useState("");
  const [livroChap, setLivroChap] = useState("");
  const [livroFrom, setLivroFrom] = useState("");
  const [livroTo, setLivroTo] = useState("");
  const [livroState, setLivroState] = useState<SearchState>(emptySearch);

  // Painel: Salmos
  const [salmoNum, setSalmoNum] = useState("");
  const [salmoFrom, setSalmoFrom] = useState("");
  const [salmoTo, setSalmoTo] = useState("");
  const [salmoState, setSalmoState] = useState<SearchState>(emptySearch);

  // Painel: Provérbios
  const [provChap, setProvChap] = useState("");
  const [provFrom, setProvFrom] = useState("");
  const [provTo, setProvTo] = useState("");
  const [provState, setProvState] = useState<SearchState>(emptySearch);

  // -------------------------------------------------------------------------
  // Handler: Livro
  // Regra: livro obrigatório. Capítulo default 1, versículo inicial default 1.
  // -------------------------------------------------------------------------
  async function handleLivroBuscar() {
    if (!livro.trim()) {
      setLivroState({ loading: false, result: null, error: "Informe o nome do livro para buscar." });
      return;
    }
    const chapter = parseInt(livroChap.trim() || "1", 10);
    const from    = parseInt(livroFrom.trim() || "1", 10);
    const to      = livroTo.trim() ? parseInt(livroTo.trim(), 10) : from;
    if (isNaN(chapter) || isNaN(from) || isNaN(to) || chapter < 1 || from < 1 || to < from) {
      setLivroState({ loading: false, result: null, error: "Valores de capítulo ou versículo inválidos." });
      return;
    }

    setLivroState({ loading: true, result: null, error: null });
    try {
      // ✅ Primary: bible-api.com
      const ref = `${livro.trim()} ${chapter}:${from}${to !== from ? `-${to}` : ""}`;
      const text = await fetchBiblePassagePrimary(ref);
      setLivroState({ loading: false, result: text, error: null });
    } catch {
      // ✅ Fallback: ABíbliaDigital
      const slug = resolveBookSlug(livro);
      if (!slug) {
        setLivroState({ loading: false, result: null, error: `Livro "${livro}" não encontrado. Verifique o nome e tente novamente.` });
        return;
      }
      try {
        const label = livro.trim().charAt(0).toUpperCase() + livro.trim().slice(1);
        const text = await fetchABDFallback(slug, chapter, from, to, label);
        setLivroState({ loading: false, result: text, error: null });
      } catch (e: any) {
        setLivroState({ loading: false, result: null, error: e.message || NOT_FOUND_MSG });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Handler: Salmos
  // Regra: número do salmo obrigatório. Versículo inicial default 1.
  // -------------------------------------------------------------------------
  async function handleSalmoBuscar() {
    if (!salmoNum.trim()) {
      setSalmoState({ loading: false, result: null, error: "Informe o número do Salmo para buscar." });
      return;
    }
    const chapter = parseInt(salmoNum.trim(), 10);
    if (isNaN(chapter) || chapter < 1) {
      setSalmoState({ loading: false, result: null, error: "Número do Salmo inválido." });
      return;
    }
    const from = parseInt(salmoFrom.trim() || "1", 10);
    const to = salmoTo.trim() ? parseInt(salmoTo.trim(), 10) : from;
    if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
      setSalmoState({ loading: false, result: null, error: "Valores de versículo inválidos." });
      return;
    }

    setSalmoState({ loading: true, result: null, error: null });
    try {
      // ✅ Primary: bolls.life
      const text = await fetchBollsPassagePrimary(19, "Salmos", String(chapter), String(from), String(to));
      setSalmoState({ loading: false, result: text, error: null });
    } catch {
      // ✅ Fallback: ABíbliaDigital
      try {
        const text = await fetchABDFallback("sl", chapter, from, to, "Salmos");
        setSalmoState({ loading: false, result: text, error: null });
      } catch (e: any) {
        setSalmoState({ loading: false, result: null, error: e.message || NOT_FOUND_MSG });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Handler: Provérbios
  // Regra: capítulo obrigatório. Versículo inicial default 1.
  // -------------------------------------------------------------------------
  async function handleProvBuscar() {
    if (!provChap.trim()) {
      setProvState({ loading: false, result: null, error: "Informe o capítulo de Provérbios para buscar." });
      return;
    }
    const chapter = parseInt(provChap.trim(), 10);
    if (isNaN(chapter) || chapter < 1) {
      setProvState({ loading: false, result: null, error: "Número do capítulo inválido." });
      return;
    }
    const from = parseInt(provFrom.trim() || "1", 10);
    const to = provTo.trim() ? parseInt(provTo.trim(), 10) : from;
    if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
      setProvState({ loading: false, result: null, error: "Valores de versículo inválidos." });
      return;
    }

    setProvState({ loading: true, result: null, error: null });
    try {
      // ✅ Primary: bolls.life
      const text = await fetchBollsPassagePrimary(20, "Provérbios", String(chapter), String(from), String(to));
      setProvState({ loading: false, result: text, error: null });
    } catch {
      // ✅ Fallback: ABíbliaDigital
      try {
        const text = await fetchABDFallback("pv", chapter, from, to, "Provérbios");
        setProvState({ loading: false, result: text, error: null });
      } catch (e: any) {
        setProvState({ loading: false, result: null, error: e.message || NOT_FOUND_MSG });
      }
    }
  }

  const hasLivroOutput = !!(livroState.result || livroState.error);
  const hasSalmoOutput = !!(salmoState.result || salmoState.error);
  const hasProvOutput = !!(provState.result || provState.error);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 220, paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.topBar}>
          <MaterialCommunityIcons name="book-cross" size={28} color={Colors.light.deepBlue} />
          <Text style={styles.screenTitle}>Bíblia</Text>
        </View>

        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="book-cross" size={20} color={Colors.light.softGold} />
          <Text style={styles.heroLabel}>Versículo de Hoje</Text>
          <Text style={styles.heroVerse}>"{dailyVerse.text}"</Text>
          <Text style={styles.heroRef}>{dailyVerse.verse}</Text>
        </View>

        <Text style={styles.sectionTitle}>Versículos Inspiradores</Text>

        {BIBLE_VERSES.map((item, idx) => (
          <View key={idx} style={styles.verseCard}>
            <View style={[styles.accent, { backgroundColor: getAccentColor(idx) }]} />
            <View style={styles.verseContent}>
              <Text style={styles.verseRef}>{item.verse}</Text>
              <Text style={styles.verseText}>"{item.text}"</Text>
            </View>
          </View>
        ))}

        <View style={styles.searchDivider}>
          <View style={styles.dividerLine} />
          <Ionicons name="search" size={18} color={Colors.light.textMuted} />
          <View style={styles.dividerLine} />
        </View>

        {/* Painel: Livro */}
        <SearchPanel
          title="Pesquisar por Livro"
          icon="book-open-variant"
          accentColor={Colors.light.deepBlue}
        >
          <LabeledInput
            label="Livro *"
            placeholder="Ex: João, Salmos, Gênesis, Tobias"
            value={livro}
            onChangeText={setLivro}
          />
          <LabeledInput
            label="Capítulo (padrão: 1)"
            placeholder="Ex: 3"
            value={livroChap}
            onChangeText={setLivroChap}
            keyboardType="numeric"
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="De (padrão: 1)"
                placeholder="1"
                value={livroFrom}
                onChangeText={setLivroFrom}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="Até (versículo)"
                placeholder="opcional"
                value={livroTo}
                onChangeText={setLivroTo}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <SearchButton
              label="Buscar"
              onPress={handleLivroBuscar}
              loading={livroState.loading}
              color={Colors.light.deepBlue}
            />
            {hasLivroOutput && (
              <ClearButton onPress={() => {
                setLivroState(emptySearch);
                setLivro("");
                setLivroChap("");
                setLivroFrom("");
                setLivroTo("");
              }} />
            )}
          </View>
          <SearchResult state={livroState} />
        </SearchPanel>

        {/* Painel: Salmos */}
        <SearchPanel
          title="Pesquisar Salmo"
          icon="music-note"
          accentColor="#9B59B6"
        >
          <LabeledInput
            label="Número do Salmo *"
            placeholder="Ex: 23"
            value={salmoNum}
            onChangeText={setSalmoNum}
            keyboardType="numeric"
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="De (padrão: 1)"
                placeholder="1"
                value={salmoFrom}
                onChangeText={setSalmoFrom}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="Até (versículo)"
                placeholder="opcional"
                value={salmoTo}
                onChangeText={setSalmoTo}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <SearchButton
              label="Buscar Salmo"
              onPress={handleSalmoBuscar}
              loading={salmoState.loading}
              color="#9B59B6"
            />
            {hasSalmoOutput && (
              <ClearButton onPress={() => {
                setSalmoState(emptySearch);
                setSalmoNum("");
                setSalmoFrom("");
                setSalmoTo("");
              }} />
            )}
          </View>
          <SearchResult state={salmoState} />
        </SearchPanel>

        {/* Painel: Provérbios */}
        <SearchPanel
          title="Pesquisar Provérbios"
          icon="lightbulb-on-outline"
          accentColor={Colors.light.gold}
        >
          <LabeledInput
            label="Capítulo de Provérbios *"
            placeholder="Ex: 3"
            value={provChap}
            onChangeText={setProvChap}
            keyboardType="numeric"
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="De (padrão: 1)"
                placeholder="1"
                value={provFrom}
                onChangeText={setProvFrom}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="Até (versículo)"
                placeholder="opcional"
                value={provTo}
                onChangeText={setProvTo}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <SearchButton
              label="Buscar Provérbios"
              onPress={handleProvBuscar}
              loading={provState.loading}
              color={Colors.light.tintDark}
            />
            {hasProvOutput && (
              <ClearButton onPress={() => {
                setProvState(emptySearch);
                setProvChap("");
                setProvFrom("");
                setProvTo("");
              }} />
            )}
          </View>
          <SearchResult state={provState} />
        </SearchPanel>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Componentes auxiliares — inalterados
// ---------------------------------------------------------------------------
function SearchPanel({
  title,
  icon,
  accentColor,
  children,
}: {
  title: string;
  icon: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.searchPanel}>
      <View style={styles.searchPanelHeader}>
        <View style={[styles.searchPanelIconBox, { backgroundColor: accentColor + "18" }]}>
          <MaterialCommunityIcons name={icon as any} size={20} color={accentColor} />
        </View>
        <Text style={[styles.searchPanelTitle, { color: accentColor }]}>{title}</Text>
      </View>
      <View style={styles.searchPanelBody}>{children}</View>
    </View>
  );
}

function LabeledInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        returnKeyType="done"
      />
    </View>
  );
}

function SearchButton({
  label,
  onPress,
  loading,
  color,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  color: string;
}) {
  return (
    <Pressable
      style={[styles.searchBtn, { backgroundColor: color, opacity: loading ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name="search" size={16} color="#fff" />
          <Text style={styles.searchBtnText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function ClearButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.clearBtn} onPress={onPress}>
      <Ionicons name="close-circle-outline" size={16} color={Colors.light.textMuted} />
      <Text style={styles.clearBtnText}>Limpar</Text>
    </Pressable>
  );
}

function SearchResult({ state }: { state: SearchState }) {
  const { settings } = useSettings();

  async function handleShare() {
    if (!state.result) return;
    try {
      const msg = "📖 " + state.result + "\n\n🙏 Compartilhado pelo app Vivo em Deus";
      await Share.share({ message: msg });
    } catch {}
  }

  if (state.loading) return null;
  if (state.error) {
    return (
      <View style={styles.resultBox}>
        <View style={styles.resultErrorRow}>
          <Ionicons name="alert-circle-outline" size={18} color={Colors.light.error} />
          <Text style={styles.resultError}>{state.error}</Text>
        </View>
      </View>
    );
  }
  if (!state.result) return null;
  return (
    <View style={styles.resultBox}>
      <Text style={[styles.resultText, settings.largeText && styles.largeText]}>
        {state.result}
      </Text>
      <Pressable onPress={handleShare} style={styles.shareBtn}>
        <Ionicons name="share-social-outline" size={18} color={Colors.light.deepBlue} />
        <Text style={styles.shareBtnText}>Compartilhar</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Utilitários de cor — inalterado
// ---------------------------------------------------------------------------
function getAccentColor(idx: number): string {
  const colors = [
    Colors.light.gold,
    Colors.light.lightBlue,
    Colors.light.deepBlue,
    "#7B68EE",
    "#27AE60",
    "#9B59B6",
    Colors.light.tintDark,
    "#E67E22",
    "#EC407A",
    "#27AE60",
  ];
  return colors[idx % colors.length];
}

// ---------------------------------------------------------------------------
// Estilos — inalterados
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  heroCard: {
    backgroundColor: Colors.light.deepBlue,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    shadowColor: Colors.light.darkNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.softGold,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
  },
  heroVerse: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: Colors.light.white,
    textAlign: "center",
    lineHeight: 30,
    fontStyle: "italic",
  },
  heroRef: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.softGold,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  verseCard: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  accent: {
    width: 4,
  },
  verseContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  verseRef: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  verseText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 24,
    fontStyle: "italic",
  },
  searchDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  searchPanel: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  searchPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  searchPanelIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchPanelTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
  },
  searchPanelBody: {
    padding: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
  },
  textInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 10,
  },
  rangeItem: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  searchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
  },
  searchBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.white,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.textMuted,
  },
  resultBox: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  resultText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 28,
  },
  resultErrorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  resultError: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.error,
    lineHeight: 22,
  },
  largeText: {
    fontSize: 20,
    lineHeight: 34,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    alignSelf: "flex-start",
  },
  shareBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
});

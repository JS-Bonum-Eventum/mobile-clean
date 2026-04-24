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
import { useSettings } from "@/context/SettingsContext";  // Linha Nova
import { BIBLE_VERSES } from "@/services/liturgiaService";

const NOT_FOUND_MSG = "Não foi possível encontrar a passagem informada.";

async function fetchBiblePassage(reference: string): Promise<string> {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=almeida`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(NOT_FOUND_MSG);
    const data = await response.json();
    if (data.error) throw new Error(NOT_FOUND_MSG);
    if (data.verses && data.verses.length > 0) {
      return data.verses
        .map((v: any) => `${v.book_name} ${v.chapter},${v.verse}\n${v.text.trim()}`)
        .join("\n\n");
    }
    if (data.text && data.text.trim().length > 0) return data.text.trim();
    throw new Error(NOT_FOUND_MSG);
  } catch (e: any) {
    throw new Error(e.message || NOT_FOUND_MSG);
  }
}

async function fetchBollsPassage(
  bookNum: number,
  bookLabel: string,
  chapter: string,
  from: string,
  to: string
): Promise<string> {
  const cap = chapter.trim();
  if (!cap) throw new Error(NOT_FOUND_MSG);
  const url = `https://bolls.life/get-text/ARA/${bookNum}/${cap}/`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(NOT_FOUND_MSG);
  const data: Array<{ pk: number; verse: number; text: string }> = await response.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error(NOT_FOUND_MSG);

  let verses = data;
  if (from.trim()) {
    const fromNum = parseInt(from.trim(), 10);
    const toNum = to.trim() ? parseInt(to.trim(), 10) : null;
    verses = data.filter((v) =>
      toNum !== null ? v.verse >= fromNum && v.verse <= toNum : v.verse >= fromNum
    );
  }
  if (verses.length === 0) throw new Error(NOT_FOUND_MSG);

  const header = `${bookLabel} ${cap}`;
  const body = verses.map((v) => `${v.verse}. ${v.text.trim()}`).join("\n\n");
  return `${header}\n\n${body}`;
}

function buildReference(
  book: string,
  chapter: string,
  from: string,
  to: string
): string {
  let ref = book.trim();
  if (chapter.trim()) ref += ` ${chapter.trim()}`;
  if (from.trim() && to.trim()) ref += `:${from.trim()}-${to.trim()}`;
  else if (from.trim()) ref += `:${from.trim()}`;
  return ref;
}

interface SearchState {
  loading: boolean;
  result: string | null;
  error: string | null;
}

const emptySearch: SearchState = { loading: false, result: null, error: null };

export default function BibliaScreen() {
  const { dailyVerse } = useLiturgy();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  // ✅ paddingTop para safe area — só iOS (notch/Dynamic Island)
  // No Android o insets.top já é tratado pela status bar nativa
  const topPad = Platform.OS === "ios" ? insets.top : 0;

  const [livro, setLivro] = useState("");
  const [livroChap, setLivroChap] = useState("");
  const [livroFrom, setLivroFrom] = useState("");
  const [livroTo, setLivroTo] = useState("");
  const [livroState, setLivroState] = useState<SearchState>(emptySearch);

  const [salmoNum, setSalmoNum] = useState("");
  const [salmoFrom, setSalmoFrom] = useState("");
  const [salmoTo, setSalmoTo] = useState("");
  const [salmoState, setSalmoState] = useState<SearchState>(emptySearch);

  const [provChap, setProvChap] = useState("");
  const [provFrom, setProvFrom] = useState("");
  const [provTo, setProvTo] = useState("");
  const [provState, setProvState] = useState<SearchState>(emptySearch);

  async function handleLivroBuscar() {
    if (!livro.trim()) return;
    setLivroState({ loading: true, result: null, error: null });
    try {
      const ref = buildReference(livro, livroChap, livroFrom, livroTo);
      const text = await fetchBiblePassage(ref);
      setLivroState({ loading: false, result: text, error: null });
    } catch (e: any) {
      setLivroState({ loading: false, result: null, error: e.message || NOT_FOUND_MSG });
    }
  }

  async function handleSalmoBuscar() {
    const num = salmoNum.trim();
    if (!num) return;
    setSalmoState({ loading: true, result: null, error: null });
    try {
      const text = await fetchBollsPassage(19, "Salmos", num, salmoFrom, salmoTo);
      setSalmoState({ loading: false, result: text, error: null });
    } catch (e: any) {
      setSalmoState({ loading: false, result: null, error: NOT_FOUND_MSG });
    }
  }

  async function handleProvBuscar() {
    if (!provChap.trim()) return;
    setProvState({ loading: true, result: null, error: null });
    try {
      const text = await fetchBollsPassage(20, "Provérbios", provChap, provFrom, provTo);
      setProvState({ loading: false, result: text, error: null });
    } catch (e: any) {
      setProvState({ loading: false, result: null, error: NOT_FOUND_MSG });
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
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 220, paddingTop: topPad + 16 }]} // ✅ safe area top
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" // 🔥 ADICIONADO
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

        <SearchPanel
          title="Pesquisar por Livro"
          icon="book-open-variant"
          accentColor={Colors.light.deepBlue}
        >
          <LabeledInput
            label="Livro"
            placeholder="Ex: João, Salmos, Gênesis"
            value={livro}
            onChangeText={setLivro}
          />
          <LabeledInput
            label="Capítulo"
            placeholder="Ex: 3"
            value={livroChap}
            onChangeText={setLivroChap}
            keyboardType="numeric"
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="De (versículo)"
                placeholder="1"
                value={livroFrom}
                onChangeText={setLivroFrom}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="Até (versículo)"
                placeholder="10"
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

        <SearchPanel
          title="Pesquisar Salmo"
          icon="music-note"
          accentColor="#9B59B6"
        >
          <LabeledInput
            label="Número do Salmo"
            placeholder="Ex: 23"
            value={salmoNum}
            onChangeText={setSalmoNum}
            keyboardType="numeric"
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="De (versículo)"
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

        <SearchPanel
          title="Pesquisar Provérbios"
          icon="lightbulb-on-outline"
          accentColor={Colors.light.gold}
        >
          <LabeledInput
            label="Capítulo de Provérbios"
            placeholder="Ex: 3"
            value={provChap}
            onChangeText={setProvChap}
            keyboardType="numeric"
          />
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <LabeledInput
                label="De (versículo)"
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

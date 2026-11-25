import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import {
  TEMAS,
  TEMA_COLORS,
  TEMA_ICONS,
  getPlanoDevocional,
  type Tema,
  type DiaDevocional,
} from "@/services/devocionaisService";


const NOT_FOUND_MSG = "Passagem não encontrada.";
const UNAVAILABLE_MSG = "Serviço temporariamente indisponível. Tente novamente em instantes.";
const MSG_DEUTERO =
  "Este livro não está disponível na versão atual.\nOs livros deuterocanônicos (Tobias, Judite, 1 e 2 Macabeus, Sabedoria, Eclesiástico e Baruc) estarão disponíveis em breve. 🙏";

// ── APIs ──────────────────────────────────────────────────────────
// Primária: bolls.life (ARA) — todos os 66 livros do cânon protestante
// Fallback: ABíbliaDigital (NVI), SEM token no app (limite público por IP)
// Obs.: bible-api.com removeu a tradução Almeida em nov/2026 — não é mais usada.
const BOLLS_BASE  = "https://bolls.life";
const BOLLS_TRANS = "ARA";
const ABD_BASE    = "https://www.abibliadigital.com.br/api";
const ABD_VERSION = "nvi";
const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, ms: number = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Cânon protestante: slug (ABíbliaDigital) → id no bolls.life + nome ──
// Os ids seguem a ordem padrão dos 66 livros (Gênesis=1 … Apocalipse=66).
// 4º item (opcional): outros nomes aceitos para o livro.
interface BibleBook { slug: string; id: number; name: string }
const CANON: Array<[string, number, string, string[]?]> = [
  ["gn", 1, "Gênesis"], ["ex", 2, "Êxodo"], ["lv", 3, "Levítico"], ["nm", 4, "Números"],
  ["dt", 5, "Deuteronômio"], ["js", 6, "Josué"], ["jz", 7, "Juízes"], ["rt", 8, "Rute"],
  ["1sm", 9, "1 Samuel"], ["2sm", 10, "2 Samuel"], ["1rs", 11, "1 Reis"], ["2rs", 12, "2 Reis"],
  ["1cr", 13, "1 Crônicas"], ["2cr", 14, "2 Crônicas"], ["ed", 15, "Esdras"], ["ne", 16, "Neemias"],
  ["et", 17, "Ester"], ["jó", 18, "Jó"], ["sl", 19, "Salmos", ["Salmo"]], ["pv", 20, "Provérbios", ["Provérbio"]],
  ["ec", 21, "Eclesiastes"], ["ct", 22, "Cântico dos Cânticos", ["Cantares", "Cantares de Salomão", "Cânticos"]],
  ["is", 23, "Isaías"], ["jr", 24, "Jeremias"], ["lm", 25, "Lamentações", ["Lamentações de Jeremias"]],
  ["ez", 26, "Ezequiel"], ["dn", 27, "Daniel"], ["os", 28, "Oseias"], ["jl", 29, "Joel"],
  ["am", 30, "Amós"], ["ob", 31, "Abdias", ["Obadias"]], ["jn", 32, "Jonas"], ["mq", 33, "Miqueias"],
  ["na", 34, "Naum"], ["hc", 35, "Habacuque", ["Habacuc"]], ["sf", 36, "Sofonias"], ["ag", 37, "Ageu"],
  ["zc", 38, "Zacarias"], ["ml", 39, "Malaquias"], ["mt", 40, "Mateus"], ["mc", 41, "Marcos"],
  ["lc", 42, "Lucas"], ["jo", 43, "João"], ["at", 44, "Atos dos Apóstolos", ["Atos"]],
  ["rm", 45, "Romanos"], ["1co", 46, "1 Coríntios"], ["2co", 47, "2 Coríntios"], ["gl", 48, "Gálatas"],
  ["ef", 49, "Efésios"], ["fp", 50, "Filipenses"], ["cl", 51, "Colossenses"],
  ["1ts", 52, "1 Tessalonicenses"], ["2ts", 53, "2 Tessalonicenses"], ["1tm", 54, "1 Timóteo"],
  ["2tm", 55, "2 Timóteo"], ["tt", 56, "Tito"], ["fm", 57, "Filemom", ["Filemon"]], ["hb", 58, "Hebreus"],
  ["tg", 59, "Tiago"], ["1pe", 60, "1 Pedro"], ["2pe", 61, "2 Pedro"], ["1jo", 62, "1 João"],
  ["2jo", 63, "2 João"], ["3jo", 64, "3 João"], ["jd", 65, "Judas"], ["ap", 66, "Apocalipse"],
];

function removeAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// "1Coríntios", "1 Coríntios", "I Coríntios", "Jo." → chave comparável ("1 corintios", "jo")
function normalizeKey(raw: string): string {
  let k = removeAccents(raw.toLowerCase()).replace(/\./g, "").replace(/\s+/g, " ").trim();
  k = k.replace(/^(iii|ii|i)\s+/, (_m, r: string) => ({ i: "1", ii: "2", iii: "3" } as Record<string, string>)[r] + " ");
  k = k.replace(/^([1-3])\s*/, "$1 ");
  return k;
}

// Nomes completos e apelidos primeiro; abreviações (slugs) só entram se não colidirem.
const BOOK_INDEX: Map<string, BibleBook> = (() => {
  const idx = new Map<string, BibleBook>();
  const books = CANON.map(([slug, id, name, aliases]) => ({ slug, id, name, aliases: aliases ?? [] }));
  for (const b of books) idx.set(normalizeKey(b.name), b);
  for (const b of books) for (const a of b.aliases) if (!idx.has(normalizeKey(a))) idx.set(normalizeKey(a), b);
  for (const b of books) if (!idx.has(normalizeKey(b.slug))) idx.set(normalizeKey(b.slug), b);
  return idx;
})();

// Deuterocanônicos: não existem na ARA — o app mostra aviso em vez de erro genérico.
const DEUTEROCANONICOS = new Set(
  ["tobias", "tobite", "judite", "sabedoria", "sabedoria de salomao", "eclesiastico", "siracida", "siracide",
   "ben sira", "baruc", "baruque", "1 macabeus", "2 macabeus", "tb", "jt", "sb", "si", "br", "1 mc", "2 mc"]
);

// A ARA traz o nome das letras hebraicas (acróstico) no início do versículo
// (ex.: Pv 31,10 começa com "Álefe."). Removemos só nesses livros e só essas letras.
// A comparação ignora acentos e maiúsculas; a lista inclui grafias alternativas.
const ACROSTICO_LIVROS = new Set([19, 20, 25]); // Salmos, Provérbios, Lamentações
const ACROSTICO_LETRAS = new Set(
  ("alefe alef aleph bete bet beth guimel gimel dalete dalet daleth he vave vav vau zaine zain zayin " +
   "hete het heth tete tet teth iode iod yod cafe caf kaf kaph lamede lamed meme mem nune nun " +
   "samerue samerre sameque samec samech samekh aine ain ayin pe tsade tsadi tsadique sade tzade " +
   "cofe cof qof qoph reche resh res chine chim chin xin sin shin tau tav taw").split(" ")
);

function cleanVerse(bookId: number, text: string): string {
  const t = text.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
  if (!ACROSTICO_LIVROS.has(bookId)) return t;
  const m = t.match(/^([^\s.]+)\.\s*/);
  return m && ACROSTICO_LETRAS.has(removeAccents(m[1].toLowerCase())) ? t.slice(m[0].length) : t;
}

// ── Referência: "Livro cap, v", "Livro cap, v-v", "Livro cap" (capítulo inteiro) ──
interface PassageRef { book: string; chapter: number; from: number | null; to: number | null }
function parseReferencia(ref: string): PassageRef | null {
  const m = ref.trim().match(/^(.+?)\s+(\d{1,3})(?:\s*[,:]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?)?$/);
  if (!m) return null;
  const chapter = parseInt(m[2], 10);
  const from = m[3] ? parseInt(m[3], 10) : null;
  const to = m[4] ? parseInt(m[4], 10) : from;
  if (chapter < 1) return null;
  if (from !== null && (from < 1 || to === null || to < from)) return null;
  return { book: m[1].trim(), chapter, from, to };
}

// ── Primária: bolls.life (ARA) ────────────────────────────────────
async function fetchBollsPassage(
  book: BibleBook, chapter: number, from: number | null, to: number | null
): Promise<string> {
  const response = await fetchWithTimeout(`${BOLLS_BASE}/get-text/${BOLLS_TRANS}/${book.id}/${chapter}/`);
  if (!response.ok) throw new Error(UNAVAILABLE_MSG);
  const data: Array<{ pk: number; verse: number; text: string }> = await response.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error(NOT_FOUND_MSG);
  const verses =
    from === null ? data : data.filter((v) => v.verse >= from && v.verse <= (to ?? from));
  if (verses.length === 0) throw new Error(NOT_FOUND_MSG);
  return `${book.name} ${chapter}\n\n${verses.map((v) => `${v.verse}. ${cleanVerse(book.id, v.text)}`).join("\n\n")}`;
}

// ── Fallback: ABíbliaDigital (NVI), sem token ─────────────────────
async function fetchABDPassage(
  slug: string, chapter: number, from: number, to: number, label: string
): Promise<string> {
  let data: any;
  let notFound = false;
  try {
    const res = await fetchWithTimeout(`${ABD_BASE}/verses/${ABD_VERSION}/${slug}/${chapter}`);
    if (res.status === 404) notFound = true;
    else if (!res.ok) throw new Error("http");
    else data = await res.json();
  } catch {
    throw new Error(UNAVAILABLE_MSG);
  }
  if (notFound) throw new Error(NOT_FOUND_MSG);
  if (!data || !Array.isArray(data.verses) || data.verses.length === 0) throw new Error(NOT_FOUND_MSG);
  const filtered = data.verses.filter((v: any) => v.number >= from && v.number <= to);
  if (!filtered.length) throw new Error(NOT_FOUND_MSG);
  return `${label} ${chapter} (NVI)\n\n${filtered.map((v: any) => `${v.number}. ${String(v.text).trim()}`).join("\n\n")}`;
}

// ── Primária → fallback. Se a primária já respondeu "a passagem não existe",
// não adianta consultar outra fonte (e esconderia o erro real do usuário). ──
async function comFallback(
  primaria: () => Promise<string>,
  reserva: () => Promise<string>
): Promise<string> {
  try {
    return await primaria();
  } catch (e) {
    if (e instanceof Error && e.message === NOT_FOUND_MSG) throw e;
    return await reserva();
  }
}

// ── buscarPassagem: Primária (bolls.life/ARA) com Fallback (ABíbliaDigital/NVI) ──
async function buscarPassagem(ref: string): Promise<string> {
  const p = parseReferencia(ref);
  if (!p) throw new Error(NOT_FOUND_MSG);
  const key = normalizeKey(p.book);
  if (DEUTEROCANONICOS.has(key)) throw new Error(MSG_DEUTERO);
  const book = BOOK_INDEX.get(key);
  if (!book) throw new Error(NOT_FOUND_MSG);
  return comFallback(
    () => fetchBollsPassage(book, p.chapter, p.from, p.to),
    () => fetchABDPassage(book.slug, p.chapter, p.from ?? 1, p.to ?? 999, book.name)
  );
}


const CHECK_KEY_PREFIX = "devocional_check_";

// ── Modal de Parabéns ─────────────────────────────────────────────
function ParabensModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.parabensSheet, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
          onPress={() => {}}
        >
          <Text style={styles.parabensEmoji}>🙏</Text>
          <Text style={styles.parabensTitle}>Parabéns!</Text>
          <Text style={styles.parabensSubtitle}>Você completou o seu Plano Devocional</Text>
          <Text style={styles.parabensMsg}>
            Que Deus te abençoe, proteja e ilumine e te conceda a graça que está buscando.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.parabensBtn, pressed && { opacity: 0.8 }]}
            onPress={onClose}
          >
            <Text style={styles.parabensBtnText}>Amém! 🙏</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PassagemModal({ referencia, onClose }: { referencia: string | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [resultado, setResultado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ spinner imediato ao abrir
  const [erro, setErro] = useState<string | null>(null);
  React.useEffect(() => {
    if (!referencia) {
      // ✅ Modal fechou — reseta para próxima abertura já mostrar spinner
      setResultado(null); setErro(null); setLoading(true);
      return;
    }
    setResultado(null); setErro(null); setLoading(true);
    // ✅ Ignora respostas atrasadas de uma passagem anterior (modal fechado/reaberto)
    let ativo = true;
    buscarPassagem(referencia)
      .then((texto) => { if (ativo) setResultado(texto); })
      .catch((e) => { if (ativo) setErro(e.message || NOT_FOUND_MSG); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [referencia]);
  async function handleShare() {
    if (!resultado) return;
    try { await Share.share({ message: "\ud83d\udcd6 " + referencia + "\n\n" + resultado + "\n\n\ud83d\ude4f Compartilhado pelo app Vivo em Deus" }); } catch {}
  }
  return (
    <Modal visible={!!referencia} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop: ocupa tela toda, toque fora fecha */}
      <View style={styles.modalBackdrop}>
        {/* Área transparente clicável para fechar */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        {/* Sheet com altura real definida — permite ScrollView crescer */}
        <View style={[styles.modalSheet, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="book-outline" size={18} color={Colors.light.deepBlue} />
              <Text style={styles.modalTitle} numberOfLines={2}>{referencia}</Text>
            </View>
            <View style={styles.modalActions}>
              {!!resultado && (
                <Pressable onPress={handleShare} style={styles.modalActionBtn} hitSlop={8}>
                  <Ionicons name="share-social-outline" size={20} color={Colors.light.deepBlue} />
                </Pressable>
              )}
              <Pressable onPress={onClose} style={styles.modalActionBtn} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.light.textMuted} />
              </Pressable>
            </View>
          </View>
          <View style={styles.modalDivider} />
          {loading ? (
            <View style={styles.modalCentered}>
              <ActivityIndicator size="large" color={Colors.light.deepBlue} />
              <Text style={styles.modalLoadingText}>Buscando passagem...</Text>
            </View>
          ) : erro ? (
            <View style={styles.modalCentered}>
              <Ionicons name="alert-circle-outline" size={36} color={Colors.light.textMuted} />
              <Text style={styles.modalErroText}>{erro}</Text>
            </View>
          ) : resultado ? (
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
              bounces={true}
            >
              <Text style={styles.modalResultado}>{resultado}</Text>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function DiaCard({ dia, accentColor, checked, onCheck }: { dia: DiaDevocional; accentColor: string; checked: boolean; onCheck: (dia: number, checked: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [passagemSelecionada, setPassagem] = useState<string | null>(null);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  async function handleShareReflexao() {
    try { await Share.share({ message: "\ud83d\ude4f " + dia.titulo + "\n\n" + dia.reflexao + "\n\n\ud83d\udcd6 " + dia.leitura + " | " + dia.salmo + " | " + dia.proverbio + "\n\n\ud83d\ude4f Compartilhado pelo app Vivo em Deus" }); } catch {}
  }

  const toggle = () => {
    scale.value = withSpring(0.97, {}, () => {
      scale.value = withSpring(1);
    });
    setOpen((p) => !p);
  };

  return (
    <>
      <Animated.View style={[styles.diaCard, animStyle]}>
      <Pressable onPress={toggle} style={styles.diaHeader}>
        {/* ✅ Checkbox — marca subtópico como concluído */}
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); onCheck(dia.dia, !checked); }}
          style={[styles.checkbox, checked && { backgroundColor: accentColor, borderColor: accentColor }]}
          hitSlop={8}
        >
          {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
        </Pressable>
        <View style={[styles.diaBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.diaBadgeText}>{dia.dia}</Text>
        </View>
        <Text style={styles.diaTitulo}>{dia.titulo}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.light.textMuted}
        />
      </Pressable>

      {open && (
        <View style={styles.diaBody}>
          <View style={styles.reflexaoRow}>
            <Text style={[styles.reflexao, { flex: 1 }]}>{dia.reflexao}</Text>
            <Pressable onPress={handleShareReflexao} style={styles.shareBtn} hitSlop={8}>
              <Ionicons name="share-social-outline" size={18} color={Colors.light.textMuted} />
            </Pressable>
          </View>

          <View style={styles.referencias}>
            <Pressable style={({ pressed }) => [styles.refRow, pressed && styles.refRowPressed]} onPress={() => setPassagem(dia.leitura)}>
              <View style={[styles.refIcon, { backgroundColor: accentColor + "18" }]}><Ionicons name="book-outline" size={14} color={accentColor} /></View>
              <View style={{ flex: 1 }}><Text style={styles.refLabel}>Leitura Bíblica</Text><Text style={[styles.refValue, styles.refValueClickable]}>{dia.leitura}</Text></View>
              <Ionicons name="chevron-forward" size={14} color={Colors.light.textMuted} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.refRow, pressed && styles.refRowPressed]} onPress={() => setPassagem(dia.salmo)}>
              <View style={[styles.refIcon, { backgroundColor: accentColor + "18" }]}><Ionicons name="musical-notes-outline" size={14} color={accentColor} /></View>
              <View style={{ flex: 1 }}><Text style={styles.refLabel}>Salmo</Text><Text style={[styles.refValue, styles.refValueClickable]}>{dia.salmo}</Text></View>
              <Ionicons name="chevron-forward" size={14} color={Colors.light.textMuted} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.refRow, pressed && styles.refRowPressed]} onPress={() => setPassagem(dia.proverbio)}>
              <View style={[styles.refIcon, { backgroundColor: accentColor + "18" }]}><Ionicons name="sparkles-outline" size={14} color={accentColor} /></View>
              <View style={{ flex: 1 }}><Text style={styles.refLabel}>Provérbio</Text><Text style={[styles.refValue, styles.refValueClickable]}>{dia.proverbio}</Text></View>
              <Ionicons name="chevron-forward" size={14} color={Colors.light.textMuted} />
            </Pressable>
          </View>
        </View>
      )}
      </Animated.View>
      <PassagemModal referencia={passagemSelecionada} onClose={() => setPassagem(null)} />
    </>
  );
}

export function PlanoDevocional() {
  const [temaSelecionado, setTemaSelecionado] = useState<Tema | null>(null);
  const [checkedDias, setCheckedDias] = useState<number[]>([]);
  const [showParabens, setShowParabens] = useState(false);

  // Carrega checks do AsyncStorage ao trocar de tema
  React.useEffect(() => {
    if (!temaSelecionado) { setCheckedDias([]); return; }
    AsyncStorage.getItem(CHECK_KEY_PREFIX + temaSelecionado)
      .then((val) => { if (val) setCheckedDias(JSON.parse(val)); else setCheckedDias([]); })
      .catch(() => setCheckedDias([]));
  }, [temaSelecionado]);

  async function handleCheck(dia: number, isChecked: boolean) {
    const novos = isChecked
      ? [...checkedDias, dia]
      : checkedDias.filter((d) => d !== dia);
    setCheckedDias(novos);
    if (temaSelecionado) {
      await AsyncStorage.setItem(CHECK_KEY_PREFIX + temaSelecionado, JSON.stringify(novos));
    }
    // Verifica se todos os 7 dias foram marcados
    if (isChecked && novos.length === 7) {
      setShowParabens(true);
    }
  }

  const handleSelectTema = (tema: Tema) => {
    setTemaSelecionado((prev) => (prev === tema ? null : tema));
  };

  const plano = temaSelecionado ? getPlanoDevocional(temaSelecionado) : null;
  const accentColor = temaSelecionado
    ? TEMA_COLORS[temaSelecionado]
    : Colors.light.deepBlue;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color={Colors.light.deepBlue}
        />
        <Text style={styles.sectionTitle}>Plano Devocional de Fé</Text>
      </View>
      <Text style={styles.sectionSub}>
        Escolha um tema e receba um plano de 7 dias
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.temasList}
      >
        {TEMAS.map((tema) => {
          const selected = temaSelecionado === tema;
          const color = TEMA_COLORS[tema];
          return (
            <Pressable
              key={tema}
              onPress={() => handleSelectTema(tema)}
              style={[
                styles.temaChip,
                selected && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text style={styles.temaEmoji}>{TEMA_ICONS[tema]}</Text>
              <Text
                style={[styles.temaLabel, selected && styles.temaLabelSelected]}
              >
                {tema}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {plano && (
        <View style={styles.planoContainer}>
          <View
            style={[styles.planoHeader, { backgroundColor: accentColor + "15" }]}
          >
            <Text style={styles.planoEmoji}>
              {TEMA_ICONS[temaSelecionado!]}
            </Text>
            <View>
              <Text style={[styles.planoTema, { color: accentColor }]}>
                {temaSelecionado}
              </Text>
              <Text style={styles.planoDias}>7 dias de devoção</Text>
            </View>
          </View>

          {plano.map((dia) => (
            <DiaCard key={dia.dia} dia={dia} accentColor={accentColor} checked={checkedDias.includes(dia.dia)} onCheck={handleCheck} />
          ))}
        </View>
      )}
    <ParabensModal visible={showParabens} onClose={() => setShowParabens(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginBottom: 14,
  },
  temasList: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 4,
  },
  temaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
  },
  temaEmoji: {
    fontSize: 15,
  },
  temaLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  temaLabelSelected: {
    color: Colors.light.white,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
  },
  planoContainer: {
    marginTop: 16,
    gap: 8,
  },
  planoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  planoEmoji: {
    fontSize: 28,
  },
  planoTema: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
  },
  planoDias: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  diaCard: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: "hidden",
  },
  diaHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  diaBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  diaBadgeText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.white,
  },
  diaTitulo: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  diaBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    paddingTop: 14,
  },
  reflexao: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 21,
  },
  referencias: {
    gap: 10,
  },
  refRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 2 },
  refRowPressed: { backgroundColor: Colors.light.borderLight },
  refIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  refLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  refValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.text },
  refValueClickable: { color: Colors.light.deepBlue, textDecorationLine: "underline" },

  reflexaoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  shareBtn: { padding: 4, marginTop: 2 },
  modalBackdrop:       { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: Colors.light.backgroundCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, height: "75%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.light.borderLight, alignSelf: "center", marginBottom: 12 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  modalTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.deepBlue, flex: 1 },
  modalActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalActionBtn: { padding: 4 },
  modalDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginBottom: 16 },
  modalScroll:        { flex: 1 },
  modalScrollContent: { flexGrow: 1, padding: 4, paddingBottom: 24 },
  modalCentered: { alignItems: "center", paddingVertical: 32, gap: 12 },
  modalLoadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  modalErroText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, textAlign: "center" },
  modalResultado: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 24 },


  // ── Checkbox ──────────────────────────────────────────────────
  checkbox:        { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.light.borderLight, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.backgroundCard },

  // ── Modal Parabéns ────────────────────────────────────────────
  parabensSheet:    { backgroundColor: Colors.light.backgroundCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 28, paddingTop: 32, alignItems: "center", gap: 12 },
  parabensEmoji:    { fontSize: 56 },
  parabensTitle:    { fontSize: 26, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: Colors.light.deepBlue, textAlign: "center" },
  parabensSubtitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.deepBlue, textAlign: "center", lineHeight: 24 },
  parabensMsg:      { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 22 },
  parabensBtn:      { backgroundColor: Colors.light.deepBlue, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginTop: 8 },
  parabensBtnText:  { fontSize: 16, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.white },
});

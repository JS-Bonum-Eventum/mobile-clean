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


const NOT_FOUND_MSG = "Passagem nao encontrada.";

async function fetchBiblePassage(reference: string): Promise<string> {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=almeida`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(NOT_FOUND_MSG);
    const data = await resp.json();
    if (data.error) throw new Error(NOT_FOUND_MSG);
    if (data.verses && data.verses.length > 0)
      return data.verses.map((v: any) => `${v.book_name} ${v.chapter},${v.verse}\n${v.text.trim()}`).join("\n\n");
    if (data.text && data.text.trim()) return data.text.trim();
    throw new Error(NOT_FOUND_MSG);
  } catch (e: any) { throw new Error(e.message || NOT_FOUND_MSG); }
}

async function fetchBollsPassage(bookNum: number, bookLabel: string, chapter: string, from: string, to: string): Promise<string> {
  const cap = chapter.trim();
  if (!cap) throw new Error(NOT_FOUND_MSG);
  const resp = await fetch(`https://bolls.life/get-text/ARA/${bookNum}/${cap}/`);
  if (!resp.ok) throw new Error(NOT_FOUND_MSG);
  const data: Array<{ pk: number; verse: number; text: string }> = await resp.json();
  if (!Array.isArray(data) || !data.length) throw new Error(NOT_FOUND_MSG);
  let verses = data;
  if (from.trim()) {
    const fn = parseInt(from, 10);
    const tn = to.trim() ? parseInt(to, 10) : null;
    verses = data.filter((v) => tn !== null ? v.verse >= fn && v.verse <= tn : v.verse >= fn);
  }
  if (!verses.length) throw new Error(NOT_FOUND_MSG);
  return `${bookLabel} ${cap}\n\n${verses.map((v) => `${v.verse}. ${v.text.trim()}`).join("\n\n")}`;
}

async function buscarPassagem(ref: string): Promise<string> {
  const r = ref.trim();
  let m: RegExpMatchArray | null;
  m = r.match(/^Salmo[s]?\s+(\d+)$/i);
  if (m) return fetchBollsPassage(19, "Salmos", m[1], "", "");
  m = r.match(/^Salmo[s]?\s+(\d+),\s*(\d+)(?:-(\d+))?$/i);
  if (m) return fetchBollsPassage(19, "Salmos", m[1], m[2], m[3] ?? m[2]);
  m = r.match(/^Prov[eé]rbios\s+(\d+),\s*(\d+)(?:-(\d+))?$/i);
  if (m) return fetchBollsPassage(20, "Proverbios", m[1], m[2], m[3] ?? m[2]);
  m = r.match(/^((?:\d\s+)?[\w\u00C0-\u00FF]+(?:\s[\w\u00C0-\u00FF]+)*)\s+(\d+),\s*(\d+)(?:-(\d+))?$/);
  if (m) {
    const from = m[3]; const to = m[4] ?? from;
    return fetchBiblePassage(`${m[1].trim()} ${m[2]}:${from}${to !== from ? "-"+to : ""}`);
  }
  return fetchBiblePassage(r);
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
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  React.useEffect(() => {
    if (!referencia) return;
    setResultado(null); setErro(null); setLoading(true);
    buscarPassagem(referencia)
      .then(setResultado)
      .catch((e) => setErro(e.message || NOT_FOUND_MSG))
      .finally(() => setLoading(false));
  }, [referencia]);
  async function handleShare() {
    if (!resultado) return;
    try { await Share.share({ message: "\ud83d\udcd6 " + referencia + "\n\n" + resultado + "\n\n\ud83d\ude4f Compartilhado pelo app Vivo em Deus" }); } catch {}
  }
  return (
    <Modal visible={!!referencia} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { paddingBottom: Math.max(24, insets.bottom + 8) }]} onPress={() => {}}>
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
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
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
              <Text style={styles.modalResultado}>{resultado}</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
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
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: Colors.light.backgroundCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, maxHeight: "80%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.light.borderLight, alignSelf: "center", marginBottom: 12 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  modalTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.deepBlue, flex: 1 },
  modalActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalActionBtn: { padding: 4 },
  modalDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginBottom: 16 },
  modalScroll: { flex: 1 }, // ✅ flex:1 garante scroll em telas pequenas (iPhone SE)
  modalCentered: { alignItems: "center", paddingVertical: 32, gap: 12 },
  modalLoadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  modalErroText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, textAlign: "center" },
  modalResultado: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 24 },

  modalActionBtn: { padding: 4 },
  modalDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginBottom: 16 },
  modalCentered: { alignItems: "center", paddingVertical: 32, gap: 12 },
  modalLoadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  modalErroText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, textAlign: "center" },

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

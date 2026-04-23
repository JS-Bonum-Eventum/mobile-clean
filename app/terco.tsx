import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,  // ✅ substitui Dimensions.get — responde a rotação no iPad
  ScrollView,
  Platform,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMysteryOfDay } from "@/utils/rosaryMysteries";
import { generateRosaryFlow } from "@/utils/rosaryFlow";
import { RealisticRosary } from "@/components/RealisticRosary";
import { useRosary } from "@/context/RosaryContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";


// ── Chaves de persistência ────────────────────────────────────────
const STORAGE_KEY_STEP    = "@terco_step_index";
const STORAGE_KEY_ACTIVE  = "@terco_active_beads";
const STORAGE_KEY_CURRENT = "@terco_current_bead";

const BTN_BLUE_LIGHT = "#4FC3F7";
const BTN_PINK_DARK  = "#C2185B";

// ══════════════════════════════════════════════════════════════════
//  Tela Salve Rainha / Terço Concluído
// ══════════════════════════════════════════════════════════════════
const SALVE_RAINHA_TEXT =
  "Salve Rainha, Mãe de misericórdia,\nvida, doçura e esperança nossa, salve!\n\n" +
  "A vós bradamos, os degredados filhos de Eva,\na vós suspiramos, gemendo e chorando\nneste vale de lágrimas.\n\n" +
  "Eia, pois, advogada nossa,\nesses vossos olhos misericordiosos a nós volvei.\n\n" +
  "E depois deste desterro nos mostrai Jesus,\nbendito fruto do vosso ventre.\n\n" +
  "Ó clemente, ó piedosa,\nó doce sempre Virgem Maria.\n\n" +
  "Rogai por nós, santa Mãe de Deus.\nPara que sejamos dignos das promessas de Cristo.\n\nAmém!";

function SalveRainhaScreen({ onRestart, botPad }: { onRestart: () => void; botPad: number }) {
  return (
    <View style={salveStyles.container}>
      <Image
        source={require("@/assets/images/mary2.png")}
        style={salveStyles.maryImage}
        resizeMode="contain"
      />
      <Text style={salveStyles.title}>✨ Terço Concluído ✨</Text>
      <Text style={salveStyles.subtitle}>Salve Rainha</Text>
      <ScrollView style={salveStyles.scroll} contentContainerStyle={salveStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={salveStyles.prayerText}>{SALVE_RAINHA_TEXT}</Text>
      </ScrollView>
      <TouchableOpacity
        style={[salveStyles.restartBtn, { marginBottom: Math.max(botPad + 16, 32) }]}
        onPress={onRestart}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="hands-pray" size={18} color="#fff" />
        <Text style={salveStyles.restartBtnText}>Rezar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const salveStyles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#f5efe6", alignItems: "center", paddingTop: 8, paddingHorizontal: 24 },
  maryImage:      { width: 288, height: 380, marginBottom: 4 },
  title:          { fontSize: 21, fontFamily: "Inter_700Bold", fontWeight: "700", color: "#1A237E", marginTop: 8, textAlign: "center" },
  subtitle:       { fontSize: 17, fontFamily: "Inter_600SemiBold", fontWeight: "600", color: "#C2185B", marginTop: 2, marginBottom: 10, textAlign: "center" },
  scroll:         { flex: 1, width: "100%" },
  scrollContent:  { paddingBottom: 12 },
  prayerText:     { fontSize: 16, fontFamily: "Inter_400Regular", color: "#2C1A4E", lineHeight: 27, textAlign: "center", letterSpacing: 0.3 },
  restartBtn:     { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: BTN_BLUE_LIGHT, paddingVertical: 12.6, paddingHorizontal: 28.8, borderRadius: 18, marginTop: 10, shadowColor: "#0277BD", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  restartBtnText: { color: "#fff", fontSize: 14.4, fontFamily: "Inter_700Bold", fontWeight: "700" },
});

// ══════════════════════════════════════════════════════════════════
const OFERECIMENTO_TEXT =
  "Divino Jesus, eu vos ofereço este terço que vou rezar, contemplando os mistérios da nossa redenção. " +
  "Concedei-me, por intercessão de Maria, vossa Mãe Santíssima, a quem me dirijo, as graças necessárias " +
  "para bem rezá-lo para ganhar as indulgências desta santa devoção.";

const GRACAS_TEXT =
  "Infinitas graças vos damos, soberana Rainha, pelos benefícios que recebemos todos os dias " +
  "de vossas mãos liberais. Dignai-vos agora e para sempre tomar-nos debaixo de vosso poderoso " +
  "amparo, e para mais vos alegrar, vos saudamos com uma Salve Rainha.";

// ══════════════════════════════════════════════════════════════════
//  Tela Principal
// ══════════════════════════════════════════════════════════════════
export default function TercoScreen() {
  const { width, height } = useWindowDimensions(); // ✅ dinâmico — responde a rotação no iPad
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom;

  const mystery = getMysteryOfDay();
  const steps   = generateRosaryFlow(mystery.items, mystery.meditations);

  const [stepIndex, setStepIndex] = useState(0);
  const { beads, active, current, toggle, next, reset, setActive, setCurrent } = useRosary();

  const advancing = useRef(false);

  const isRestored = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      isRestored.current = false;
      (async () => {
        try {
          const [storedStep, storedActive, storedCurrent] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_STEP),
            AsyncStorage.getItem(STORAGE_KEY_ACTIVE),
            AsyncStorage.getItem(STORAGE_KEY_CURRENT),
          ]);
          if (storedStep    !== null) setStepIndex(parseInt(storedStep, 10));
          if (storedActive  !== null && setActive)  setActive(JSON.parse(storedActive));
          if (storedCurrent !== null && setCurrent)  setCurrent(parseInt(storedCurrent, 10));
        } catch (_) {}
        isRestored.current = true;
      })();
    }, [])
  );

  useEffect(() => {
    if (!isRestored.current) return;
    AsyncStorage.setItem(STORAGE_KEY_STEP, String(stepIndex)).catch(() => {});
  }, [stepIndex]);

  useEffect(() => {
    if (!isRestored.current) return;
    AsyncStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(active)).catch(() => {});
  }, [active]);

  useEffect(() => {
    if (!isRestored.current) return;
    AsyncStorage.setItem(STORAGE_KEY_CURRENT, String(current)).catch(() => {});
  }, [current]);

  // ── Derivados ────────────────────────────────────────────────────
  const isFinalStep = steps[stepIndex]?.type === "salve";
  const isLastStep  = stepIndex >= steps.length - 1;
  const currentStep = steps[stepIndex];

  // ── Reseta cores ao chegar no Salve Rainha ───────────────────────
  const salveTriggered = useRef(false);
  useEffect(() => {
    if (isFinalStep && !salveTriggered.current) {
      salveTriggered.current = true;
      if (setActive) setActive(new Array(beads.length).fill(false));
    }
    if (!isFinalStep) salveTriggered.current = false;
  }, [isFinalStep]);

  function handlePress(i: number) {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(i);
  }

  // ── nextStep corrigido ────────────────────────────────────────────
  // ✅ Lê o step SEGUINTE (stepIndex + 1) para acender a conta em
  //    sincronia com o texto que vai aparecer na tela, eliminando o
  //    atraso de 1 conta que existia antes.
  function nextStep() {
    if (isLastStep || isFinalStep) return;
    if (advancing.current) return;
    advancing.current = true;
    setTimeout(() => { advancing.current = false; }, 300);

    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const nextIndex = stepIndex + 1;
    const nextStepData = steps[nextIndex];   // ✅ step que VAI aparecer

    if (nextStepData?.hasBead && nextStepData.beadIndex !== undefined) {
      setCurrent(nextStepData.beadIndex);
      setActive((prev) => {
        const updated = [...prev];
        updated[nextStepData.beadIndex!] = true;
        return updated;
      });
    }

    setStepIndex(nextIndex);
  }

  async function handleReset() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    advancing.current      = false;
    salveTriggered.current = false;
    reset();
    setStepIndex(0);
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_STEP, STORAGE_KEY_ACTIVE, STORAGE_KEY_CURRENT]);
    } catch (_) {}
  }

  // ── Tela Salve Rainha ─────────────────────────────────────────────
  if (isFinalStep) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5efe6" }}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#1A237E" />
            <Text style={styles.backText}>Orações</Text>
          </TouchableOpacity>
        </View>
        <SalveRainhaScreen onRestart={handleReset} botPad={botPad} />
      </View>
    );
  }

  // ── Conteúdo extra do step ────────────────────────────────────────
  const extraText =
    currentStep?.type === "sinal"    ? OFERECIMENTO_TEXT :
    currentStep?.type === "gracas"   ? GRACAS_TEXT :
    currentStep?.type === "misterio" ? (currentStep.meditation ?? null) :
    null;

  const isLongPrayer = currentStep?.type === "sinal" || currentStep?.type === "gracas";

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1A237E" />
          <Text style={styles.backText}>Orações</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Santo Terço</Text>
        <View style={{ width: 80 }} />
      </View>

      <Text style={styles.screenSubtitle}>
        Reze o Santo Terço de forma interativa, acompanhando cada conta.
      </Text>

      <View style={styles.rosaryContainer}>
        <RealisticRosary
          beads={beads}
          active={active}
          current={current}
          onPress={handlePress}
          width={width}
          height={height * 0.46}
        />
      </View>

      <View style={[styles.prayerBox, isLongPrayer && styles.prayerBoxLarge]}>
        <Text style={styles.mysteryLabel}>{mystery.title}</Text>
        <Text style={styles.stepLabel}>{currentStep?.label}</Text>
        {extraText ? (
          <ScrollView
            style={[styles.extraScroll, isLongPrayer && styles.extraScrollLarge]}
            showsVerticalScrollIndicator={false}
          >
            {currentStep?.type === "sinal" && (
              <View style={styles.signRow}>
                <Ionicons name="add" size={18} color="#7B1FA2" style={{ marginRight: 4 }} />
                <Text style={styles.signText}>
                  Em nome do Pai, do Filho e do Espírito Santo. Amém.
                </Text>
              </View>
            )}
            <Text style={styles.extraText}>{extraText}</Text>
          </ScrollView>
        ) : null}
      </View>

      <View style={[styles.controls, { paddingBottom: Math.max(botPad + 8, 24) }]}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Ionicons name="refresh-circle" size={23} color="#fff" />
          <Text style={styles.resetBtnText}>Recomeçar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextBtn, isLastStep && styles.nextBtnDisabled]}
          onPress={nextStep}
          disabled={isLastStep}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {currentStep?.type === "gracas" ? "Salve Rainha" : "Avançar"}
          </Text>
          <Ionicons
            name={currentStep?.type === "gracas" ? "heart" : "arrow-forward-circle"}
            size={23}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: "#f5efe6" },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 2 },
  backBtn:          { flexDirection: "row", alignItems: "center", gap: 2, width: 80 },
  backText:         { fontSize: 15, fontFamily: "Inter_600SemiBold", fontWeight: "600", color: "#1A237E" },
  headerTitle:      { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700", color: "#1A237E", textAlign: "center" },
  screenSubtitle:   { fontSize: 12, fontFamily: "Inter_400Regular", color: "#888", textAlign: "center", paddingHorizontal: 24, lineHeight: 17 },
  rosaryContainer:  { alignItems: "center", justifyContent: "center", marginTop: 0 },
  prayerBox:        { flex: 1, alignItems: "center", paddingHorizontal: 16, marginTop: 4, gap: 4 },
  prayerBoxLarge:   { flex: 1.9 },
  mysteryLabel:     { fontSize: 12, fontFamily: "Inter_400Regular", color: "#999", textAlign: "center" },
  stepLabel:        { fontSize: 20, fontFamily: "Inter_700Bold", fontWeight: "700", color: "#1A237E", textAlign: "center", lineHeight: 27 },
  extraScroll:      { maxHeight: 80, width: "100%" },
  extraScrollLarge: { maxHeight: 170 },
  signRow:          { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  signText:         { fontSize: 14, fontFamily: "Inter_600SemiBold", fontWeight: "600", color: "#7B1FA2", textAlign: "center", flexShrink: 1 },
  extraText:        { fontSize: 14, fontFamily: "Inter_400Regular", color: "#333", textAlign: "center", lineHeight: 22 },
  controls:         { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  resetBtn:         { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BTN_BLUE_LIGHT, paddingVertical: 12.6, paddingHorizontal: 16.2, borderRadius: 16, flex: 1, justifyContent: "center", shadowColor: "#0277BD", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 8 },
  resetBtnText:     { fontSize: 14.4, fontFamily: "Inter_700Bold", fontWeight: "700", color: "#fff" },
  nextBtn:          { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BTN_PINK_DARK, paddingVertical: 12.6, paddingHorizontal: 16.2, borderRadius: 16, flex: 1, justifyContent: "center", shadowColor: "#880E4F", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 10 },
  nextBtnDisabled:  { opacity: 0.45 },
  nextBtnText:      { fontSize: 14.4, fontFamily: "Inter_700Bold", fontWeight: "700", color: "#fff" },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLiturgy } from "@/context/LiturgyContext";
import { LiturgyCard } from "@/components/ui/LiturgyCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { DonationBanner } from "@/components/ui/DonationBanner";
import { HomeHeader } from "@/components/ui/HomeHeader";
import { PlanoDevocional } from "@/components/ui/PlanoDevocional";
import { IntencaoDoDia } from "@/components/ui/IntencaoDoDia";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchSantoDodia, getSantoDodia } from "@/services/santosService";
import type { Santo } from "@/services/santosService";

// ✅ AdBanner removido desta tela — movido para mural/index.tsx

export default function HomeScreen() {
  const router = useRouter();
  const { liturgy, isLoading, error, refresh, dailyPhrase, dailyVerse } =
    useLiturgy();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [santo, setSanto] = React.useState<Santo | null>(null);
  const [santoLoading, setSantoLoading] = React.useState(true);
  const [santoModalVisible, setSantoModalVisible] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetchSantoDodia()
      .then((s) => { if (!cancelled) setSanto(s); })
      .catch(() => { if (!cancelled) setSanto(getSantoDodia()); })
      .finally(() => { if (!cancelled) setSantoLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <View style={styles.root}>
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "ios" ? bottomPad + 120 : bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.gold}
            colors={[Colors.light.gold]}
          />
        }
      >
        {liturgy?.isOffline ? (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline-outline" size={14} color={Colors.light.textMuted} />
            <Text style={styles.offlineText}>
              {liturgy.offlineMessage ?? "Conteúdo offline exibido"}
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Hoje</Text>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <LiturgyCard
              title="Oração do Dia"
              icon={<MaterialCommunityIcons name="hands-pray" size={20} color={Colors.light.gold} />}
              content={liturgy?.oracaodia || "Senhor, ilumina nosso dia com a tua graça. Amém."}
              accentColor={Colors.light.gold}
            />
            <LiturgyCard
              title="Frase do Dia"
              icon={<Ionicons name="sparkles" size={18} color={Colors.light.lightBlue} />}
              content={dailyPhrase}
              accentColor={Colors.light.lightBlue}
            />
            {santoLoading ? (
              <SkeletonCard />
            ) : (
              <LiturgyCard
                title="Santo do Dia"
                reference={santo?.festa || ""}
                icon={<Ionicons name="star" size={18} color={Colors.light.gold} />}
                content={santo ? `${santo.nome}\n\n${santo.descricao}` : "Santo do dia indisponível"}
                accentColor={Colors.light.gold}
                onPress={() => santo && setSantoModalVisible(true)}
              />
            )}
          </>
        )}

        <IntencaoDoDia />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Plano Devocional</Text>
        <PlanoDevocional />

        <Text style={styles.sectionTitle}>Liturgia</Text>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {liturgy?.evangelho ? (
              <LiturgyCard
                title="Evangelho do Dia"
                reference={liturgy.evangelho.referencia}
                content={liturgy.evangelho.texto}
                icon={<Ionicons name="book" size={18} color={Colors.light.deepBlue} />}
                accentColor={Colors.light.deepBlue}
                onPress={() =>
                  router.push({
                    pathname: "/reading",
                    params: {
                      title: "Evangelho do Dia",
                      reference: liturgy.evangelho!.referencia,
                      heading: liturgy.evangelho!.titulo,
                      content: liturgy.evangelho!.texto,
                      aclamacaoRefrao: liturgy.aclamacaoEvangelho?.refrao ?? "",
                      aclamacaoVersiculo: liturgy.aclamacaoEvangelho?.versiculo ?? "",
                    },
                  })
                }
                compact
              />
            ) : null}

            {liturgy?.primeiraLeitura ? (
              <LiturgyCard
                title="1ª Leitura"
                reference={liturgy.primeiraLeitura.referencia}
                content={liturgy.primeiraLeitura.texto}
                icon={<Ionicons name="book-outline" size={18} color="#7B68EE" />}
                accentColor="#7B68EE"
                onPress={() =>
                  router.push({
                    pathname: "/reading",
                    params: {
                      title: "1ª Leitura",
                      reference: liturgy.primeiraLeitura!.referencia,
                      heading: liturgy.primeiraLeitura!.titulo,
                      content: liturgy.primeiraLeitura!.texto,
                    },
                  })
                }
                compact
              />
            ) : null}

            {liturgy?.segundaLeitura ? (
              <LiturgyCard
                title="2ª Leitura"
                reference={liturgy.segundaLeitura.referencia}
                content={liturgy.segundaLeitura.texto}
                icon={<Ionicons name="book-outline" size={18} color="#9B59B6" />}
                accentColor="#9B59B6"
                onPress={() =>
                  router.push({
                    pathname: "/reading",
                    params: {
                      title: "2ª Leitura",
                      reference: liturgy.segundaLeitura!.referencia,
                      heading: liturgy.segundaLeitura!.titulo,
                      content: liturgy.segundaLeitura!.texto,
                    },
                  })
                }
                compact
              />
            ) : null}

            {liturgy?.salmo ? (
              <LiturgyCard
                title="Salmo Responsorial"
                reference={liturgy.salmo.referencia}
                content={
                  liturgy.salmo.refrao
                    ? `Refrão: ${liturgy.salmo.refrao}\n\n${liturgy.salmo.texto}`
                    : liturgy.salmo.texto
                }
                icon={<Ionicons name="musical-notes" size={18} color="#27AE60" />}
                accentColor="#27AE60"
                onPress={() =>
                  router.push({
                    pathname: "/reading",
                    params: {
                      title: "Salmo Responsorial",
                      reference: liturgy.salmo!.referencia,
                      heading: liturgy.salmo!.refrao
                        ? `Refrão: ${liturgy.salmo!.refrao}`
                        : "Salmo Responsorial",
                      content: liturgy.salmo!.texto,
                    },
                  })
                }
                compact
              />
            ) : null}

            {!liturgy?.evangelho && !liturgy?.primeiraLeitura && !liturgy?.salmo ? (
              <View style={styles.emptyLiturgy}>
                <Ionicons name="book-outline" size={32} color={Colors.light.textMuted} />
                <Text style={styles.emptyText}>Liturgia não disponível no momento</Text>
              </View>
            ) : null}
          </>
        )}

        <Text style={styles.sectionTitle}>Versículo</Text>

        <LiturgyCard
          title="Versículo da Bíblia"
          reference={dailyVerse.verse}
          content={`"${dailyVerse.text}"`}
          icon={<Ionicons name="text" size={18} color={Colors.light.tintDark} />}
          accentColor={Colors.light.tintDark}
        />

        <DonationBanner />
      </ScrollView>

      <Modal
        visible={santoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSantoModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSantoModalVisible(false)}>
          <Pressable
            style={[styles.modalSheet, { paddingBottom: Math.max(40, insets.bottom + 16) }]}
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalIconRow}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="star" size={32} color={Colors.light.gold} />
              </View>
            </View>
            <Text style={styles.modalTag}>Santo do Dia</Text>
            <Text style={styles.modalTitle}>{santo?.nome || "Santo do Dia"}</Text>
            {santo?.festa ? <Text style={styles.modalFesta}>{santo.festa}</Text> : null}
            <Text style={styles.modalDescricao}>
              {santo?.descricao || "Informações detalhadas não disponíveis hoje."}
            </Text>
            <Pressable onPress={() => setSantoModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: Colors.light.cream },
  scroll:          { flex: 1 },
  content:         { padding: 16, paddingTop: 20 },
  sectionTitle:    { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.textMuted, textTransform: "uppercase" as const, letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },
  divider:         { height: 3, backgroundColor: Colors.light.gold, width: "90%", borderRadius: 2, alignSelf: "center", marginVertical: 20 },
  offlineBadge:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, alignSelf: "center", marginBottom: 16 },
  offlineText:     { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  errorBanner:     { backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:       { fontSize: 13, color: "#B91C1C", fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyLiturgy:    { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText:       { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, textAlign: "center" },
  modalBackdrop:   { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet:      { backgroundColor: Colors.light.backgroundCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  modalHandle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.light.borderLight, alignSelf: "center", marginBottom: 8 },
  modalIconRow:    { alignItems: "center", marginBottom: 4 },
  modalIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.light.gold + "20", alignItems: "center", justifyContent: "center" },
  modalTag:        { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.textMuted, textTransform: "uppercase" as const, letterSpacing: 1.2, textAlign: "center" },
  modalTitle:      { fontSize: 22, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: Colors.light.deepBlue, textAlign: "center", lineHeight: 30 },
  modalFesta:      { fontSize: 14, fontFamily: "Inter_500Medium", fontWeight: "500" as const, color: Colors.light.gold, textAlign: "center" },
  modalDescricao:  { fontSize: 16, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 26, marginTop: 4 },
  modalCloseBtn:   { backgroundColor: Colors.light.deepBlue, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  modalCloseBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: Colors.light.white, letterSpacing: 0.5 },
});

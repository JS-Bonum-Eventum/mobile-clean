import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLiturgy } from "@/context/LiturgyContext";
import { LiturgyCard } from "@/components/ui/LiturgyCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import Colors from "@/constants/colors";

export default function EvangelhoScreen() {
  const { liturgy, isLoading } = useLiturgy();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Ionicons name="book" size={28} color={Colors.light.deepBlue} />
        <Text style={styles.screenTitle}>Evangelho do Dia</Text>
      </View>

      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : liturgy?.evangelho ? (
        <LiturgyCard
          title="Evangelho"
          reference={liturgy.evangelho.referencia}
          content={liturgy.evangelho.titulo}
          icon={
            <Ionicons name="book" size={18} color={Colors.light.deepBlue} />
          }
          accentColor={Colors.light.deepBlue}
          onPress={() =>
            router.push({
              pathname: "/reading",
              params: {
                title: "Evangelho do Dia",
                reference: liturgy.evangelho!.referencia,
                heading: liturgy.evangelho!.titulo,
                content: liturgy.evangelho!.texto,
              },
            })
          }
        >
          <Text style={styles.preview} numberOfLines={5}>
            {liturgy.evangelho.texto}
          </Text>
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Ler completo</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={Colors.light.deepBlue}
            />
          </View>
        </LiturgyCard>
      ) : (
        <View style={styles.empty}>
          <Ionicons
            name="book-outline"
            size={40}
            color={Colors.light.textMuted}
          />
          <Text style={styles.emptyText}>
            Evangelho não disponível para hoje
          </Text>
        </View>
      )}

      <View style={styles.liturgyInfo}>
        <Text style={styles.liturgyLabel}>Tempo Litúrgico</Text>
        <Text style={styles.liturgyValue}>
          {liturgy?.liturgia || "—"}
        </Text>
        {liturgy?.cor ? (
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: getLiturgicalColor(liturgy.cor) },
              ]}
            />
            <Text style={styles.liturgyValue}>{liturgy.cor}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getLiturgicalColor(cor: string): string {
  const map: Record<string, string> = {
    verde: "#27AE60",
    roxo: "#8E44AD",
    vermelho: "#E74C3C",
    branco: "#BDC3C7",
    rosa: "#EC407A",
    dourado: "#F39C12",
  };
  return map[cor.toLowerCase()] ?? Colors.light.gold;
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
    color: Colors.light.deepBlue,
  },
  preview: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 24,
    marginTop: 4,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.deepBlue,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  liturgyInfo: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  liturgyLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 4,
  },
  liturgyValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

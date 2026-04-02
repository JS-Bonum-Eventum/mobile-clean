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

export default function LeiturasScreen() {
  const { liturgy, isLoading } = useLiturgy();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const hasAnyReading =
    !!liturgy?.primeiraLeitura ||
    !!liturgy?.segundaLeitura ||
    !!liturgy?.salmo;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Ionicons name="book-outline" size={28} color="#7B68EE" />
        <Text style={styles.screenTitle}>Leituras</Text>
      </View>

      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : !hasAnyReading ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={40} color={Colors.light.textMuted} />
          <Text style={styles.emptyText}>
            Não foi possível carregar o conteúdo de hoje
          </Text>
        </View>
      ) : (
        <>
          {liturgy?.primeiraLeitura ? (
            <LiturgyCard
              title="1ª Leitura"
              reference={liturgy.primeiraLeitura.referencia}
              icon={
                <Ionicons name="book-outline" size={18} color="#7B68EE" />
              }
              accentColor="#7B68EE"
              onPress={() =>
                router.push({
                  pathname: "/reading",
                  params: {
                    title: "1ª Leitura",
                    reference: liturgy.primeiraLeitura!.referencia,
                    heading: liturgy.primeiraLeitura!.titulo ?? "1ª Leitura",
                    content: liturgy.primeiraLeitura!.texto,
                  },
                })
              }
            >
              <Text style={styles.heading}>
                {liturgy.primeiraLeitura.titulo}
              </Text>
              <Text style={styles.preview} numberOfLines={4}>
                {liturgy.primeiraLeitura.texto}
              </Text>
              <ReadMoreRow color="#7B68EE" />
            </LiturgyCard>
          ) : null}

          {liturgy?.salmo ? (
            <LiturgyCard
              title="Salmo Responsorial"
              reference={liturgy.salmo.referencia}
              icon={
                <Ionicons name="musical-notes" size={18} color="#27AE60" />
              }
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
            >
              {liturgy.salmo.refrao ? (
                <Text style={styles.refrao}>
                  Refrão: {liturgy.salmo.refrao}
                </Text>
              ) : null}
              <Text style={styles.preview} numberOfLines={4}>
                {liturgy.salmo.texto}
              </Text>
              <ReadMoreRow color="#27AE60" />
            </LiturgyCard>
          ) : null}

          {liturgy?.segundaLeitura ? (
            <LiturgyCard
              title="2ª Leitura"
              reference={liturgy.segundaLeitura.referencia}
              icon={
                <Ionicons name="book-outline" size={18} color="#9B59B6" />
              }
              accentColor="#9B59B6"
              onPress={() =>
                router.push({
                  pathname: "/reading",
                  params: {
                    title: "2ª Leitura",
                    reference: liturgy.segundaLeitura!.referencia,
                    heading: liturgy.segundaLeitura!.titulo ?? "2ª Leitura",
                    content: liturgy.segundaLeitura!.texto,
                  },
                })
              }
            >
              <Text style={styles.heading}>
                {liturgy.segundaLeitura.titulo}
              </Text>
              <Text style={styles.preview} numberOfLines={4}>
                {liturgy.segundaLeitura.texto}
              </Text>
              <ReadMoreRow color="#9B59B6" />
            </LiturgyCard>
          ) : (
            <View style={styles.noSecondReading}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.light.textMuted} />
              <Text style={styles.noSecondReadingText}>
                Hoje não há segunda leitura
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function ReadMoreRow({ color }: { color: string }) {
  return (
    <View style={styles.readMore}>
      <Text style={[styles.readMoreText, { color }]}>Ler completo</Text>
      <Ionicons name="chevron-forward" size={14} color={color} />
    </View>
  );
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
  heading: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  refrao: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: "#27AE60",
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 20,
  },
  preview: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
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
  },
  noSecondReading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  noSecondReadingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
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
});

import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDatePT(date: Date): string {
  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
}

export function HomeHeader() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const router = useRouter();

  return (
    <View style={[styles.header, { paddingTop: topPad + 12 }]}>
      <View style={styles.settingsRow}>
        <Pressable
          onPress={() => router.push("/menu")}
          style={styles.menuBtn}
          hitSlop={8}
        >
          <Ionicons name="menu" size={26} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <View style={styles.crossRow}>
          <View style={styles.crossVertical} />
          <View style={styles.crossHorizontal} />
        </View>
        <Pressable
          onPress={() => router.push("/settings")}
          style={styles.settingsBtn}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
      <Text style={styles.appName}>Vivo em Deus</Text>
      <Text style={styles.date}>{formatDatePT(new Date())}</Text>
      <Text style={styles.greeting}>{getGreeting()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.light.deepBlue,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
  },
  settingsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  crossRow: {
    width: 32,
    height: 32,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  crossVertical: {
    position: "absolute",
    width: 3,
    height: 32,
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
  },
  crossHorizontal: {
    position: "absolute",
    width: 20,
    height: 3,
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
    top: 8,
  },
  menuBtn: {
    position: "absolute",
    left: 0,
    padding: 4,
  },
  settingsBtn: {
    position: "absolute",
    right: 0,
    padding: 4,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.softGold,
    marginBottom: 2,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.7)",
  },
});

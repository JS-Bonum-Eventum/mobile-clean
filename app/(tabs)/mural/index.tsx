import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { MuralCategoria } from "@/services/muralService";

type MuralOption = {
  label: MuralCategoria;
  icon: string;
};

const OPTIONS: MuralOption[] = [
  { label: "Eventos",              icon: "calendar-outline" },
  { label: "Bandas",               icon: "musical-notes-outline" },
  { label: "Shows",                icon: "mic-outline" },
  { label: "Serviços",             icon: "construct-outline" },
  { label: "Indicações",           icon: "thumbs-up-outline" },
  { label: "Produtos Religiosos",  icon: "pricetag-outline" },
  { label: "Comunidade",           icon: "people-outline" },
  { label: "Apoiadores Parceiros", icon: "ribbon-outline" },
];

export default function MuralIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mural</Text>
        <Text style={styles.subtitle}>Espaço Católico</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "ios" ? insets.bottom + 100 : 32 }]} // ✅ iOS: tab bar flutuante | Android: mantém 32
        showsVerticalScrollIndicator={false}
      >
        {OPTIONS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/mural/detalhe",
                params: { categoria: item.label },
              })
            }
            activeOpacity={0.75}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color="#1A237E"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#fff" },
  header:     { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:      { fontSize: 26, fontWeight: "700", color: "#1A237E", marginBottom: 2 },
  subtitle:   { fontSize: 14, color: "#888", marginBottom: 8 },
  list:       { paddingHorizontal: 16, paddingBottom: 32, gap: 10 }, // base
  button:     { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", padding: 15, borderRadius: 12 },
  icon:       { marginRight: 14 },
  buttonText: { flex: 1, fontSize: 16, color: "#222" },
});

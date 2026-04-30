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
import { AdBanner } from "@/components/ui/AdBanner";

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
  // ✅ Bug 1: garante scroll no iPhone SE com tab bar flutuante
  const tabBarHeight = Platform.OS === "ios" ? 83 : 56;
  const listPaddingBottom = insets.bottom + tabBarHeight + 16;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mural</Text>
        <Text style={styles.subtitle}>Espaço Católico</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: listPaddingBottom }]}
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

        {/* Espaço entre última categoria e AdBanner */}
        <View style={styles.adSpacer} />
        <AdBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#fff" },
  header:     { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:      { fontSize: 26, fontWeight: "700", color: "#1A237E", marginBottom: 2 },
  subtitle:   { fontSize: 14, color: "#888", marginBottom: 8 },
  list:       { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  button:     { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", padding: 15, borderRadius: 12 },
  icon:       { marginRight: 14 },
  buttonText: { flex: 1, fontSize: 16, color: "#222" },
  adSpacer:   { height: 8 },
});

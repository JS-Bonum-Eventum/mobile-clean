import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { MuralCategoria } from "@/services/muralService";
import { AdBanner } from "@/components/ui/AdBanner";

const CONTACT_EMAIL = "vivoemdeusvivo@gmail.com";

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
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mural</Text>
        <Text style={styles.subtitle}>Espaço Católico</Text>
      </View>

      {/* Lista de categorias */}
      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "ios" ? insets.bottom + 100 : 32 },
        ]}
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
            <Ionicons name={item.icon as any} size={22} color="#1A237E" style={styles.icon} />
            <Text style={styles.buttonText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>
        ))}

        {/* AdBanner no rodapé da lista */}
        <AdBanner />
      </ScrollView>

      {/* ── Banner fixo "Espaço para apoiadores" ── */}
      {/* Discreto, não bloqueia navegação, apenas informa disponibilidade */}
      <TouchableOpacity
        style={[
          styles.apoiadorBanner,
          { paddingBottom: Platform.OS === "ios" ? insets.bottom + 4 : 10 },
        ]}
        onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        activeOpacity={0.8}
      >
        <Ionicons name="megaphone-outline" size={14} color="#C2185B" />
        <Text style={styles.apoiadorText}>
          Espaço para apoiadores — <Text style={styles.apoiadorLink}>Contate-nos</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:  { fontSize: 26, fontWeight: "700", color: "#1A237E", marginBottom: 2 },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 8 },

  list:       { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  button:     { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", padding: 15, borderRadius: 12 },
  icon:       { marginRight: 14 },
  buttonText: { flex: 1, fontSize: 16, color: "#222" },

  // ── Banner fixo no rodapé ────────────────────────────────────
  apoiadorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(194,24,91,0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(194,24,91,0.12)",
    paddingTop: 10,
    minHeight: 44,
  },
  apoiadorText: { fontSize: 12, color: "#888" },
  apoiadorLink: { color: "#C2185B", fontWeight: "600" },
});

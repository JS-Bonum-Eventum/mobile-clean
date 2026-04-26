import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { MuralCategoria } from "@/services/muralService";
import { AdBanner } from "@/components/ui/AdBanner";

const CONTACT_EMAIL = "vivoemdeusvivo@gmail.com";

// ── Altura aproximada da tab bar por plataforma ───────────────────
// iOS com Liquid Glass: ~83px | Android: ~56px
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;

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

// ── Altura do banner fixo ─────────────────────────────────────────
const BANNER_HEIGHT = 44;

export default function MuralIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Espaço abaixo do banner: tab bar + safe area bottom
  const bottomSpace = TAB_BAR_HEIGHT + insets.bottom;

  return (
    // View raiz ocupa toda a tela descontando a tab bar
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Mural</Text>
        <Text style={styles.subtitle}>Espaço Católico</Text>
      </View>

      {/* Lista — ocupa o espaço entre header e banner fixo */}
      <FlatList
        data={OPTIONS}
        keyExtractor={(item) => item.label}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          // Padding extra para o conteúdo não ficar atrás do AdBanner
          { paddingBottom: BANNER_HEIGHT + bottomSpace + 8 }, // ✅ espaço para o banner fixo
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
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
        )}
        // AdBanner no rodapé da lista (dentro do scroll)
        ListFooterComponent={<AdBanner />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* ── Banner fixo "Espaço para apoiadores" ─────────────────
          Fica ACIMA da tab bar, usando marginBottom para não
          ficar escondido atrás dela em nenhuma plataforma.
      ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[
          styles.apoiadorBanner,
          { bottom: bottomSpace },
        ]}
        onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        activeOpacity={0.8}
      >
        <Ionicons name="megaphone-outline" size={14} color="#C2185B" />
        <Text style={styles.apoiadorText}>
          Espaço para apoiadores —{" "}
          <Text style={styles.apoiadorLink}>Contate-nos</Text>
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },

  // ── Lista ─────────────────────────────────────────────────────
  list: {
    flex: 1, // ocupa todo espaço disponível entre header e banner
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  separator: {
    height: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
  },
  icon: {
    marginRight: 14,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },

  // ── Banner fixo no rodapé ─────────────────────────────────────
  apoiadorBanner: {
    position: "absolute",   // ✅ sobrepõe ao layout, sempre visível
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: BANNER_HEIGHT,
    backgroundColor: "rgba(194,24,91,0.97)",  // quase opaco para não misturar com lista
    borderTopWidth: 1,
    borderTopColor: "rgba(194,24,91,0.20)",
  },
  apoiadorText: {
    fontSize: 12,
    color: "#888",
  },
  apoiadorLink: {
    color: "#C2185B",
    fontWeight: "600",
  },
});

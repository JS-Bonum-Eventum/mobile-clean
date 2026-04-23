import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import Colors from "@/constants/colors";
import { ConsentModal } from "@/components/ui/ConsentModal";

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  action: () => void;
}

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [showAdPrefs, setShowAdPrefs] = useState(false);

  const handleRateApp = async () => {
    // ✅ URL separada por plataforma
    const storeUrl = Platform.OS === "ios"
      ? "https://apps.apple.com/app/idSEU_APP_ID_AQUI" // ← substitua pelo ID real após publicar na App Store
      : "https://play.google.com/store/apps/details?id=com.vivoemdeus.app";

    const canOpen = await Linking.canOpenURL(storeUrl);
    if (canOpen) {
      await Linking.openURL(storeUrl);
    } else {
      Alert.alert(
        "Avaliar aplicativo",
        Platform.OS === "ios"
          ? "Não foi possível abrir a App Store. Busque por 'Vivo em Deus' na loja."
          : "Não foi possível abrir a Play Store. Busque por 'Vivo em Deus' na loja.",
        [{ text: "OK" }]
      );
    }
  };

  const MENU_ITEMS: MenuItem[] = [
    {
      id: "sobre",
      icon: "information-circle-outline",
      iconColor: Colors.light.deepBlue,
      label: "Sobre o aplicativo",
      action: () =>
        router.push({
          pathname: "/info",
          params: { tipo: "sobre", titulo: "Sobre o aplicativo" },
        }),
    },
    {
      id: "termos",
      icon: "document-text-outline",
      iconColor: "#7B68EE",
      label: "Termos de uso",
      action: () =>
        router.push({
          pathname: "/info",
          params: { tipo: "termos", titulo: "Termos de uso" },
        }),
    },
    {
      id: "privacidade",
      icon: "shield-checkmark-outline",
      iconColor: "#27AE60",
      label: "Política de privacidade",
      action: () =>
        router.push({
          pathname: "/info",
          params: { tipo: "privacidade", titulo: "Política de privacidade" },
        }),
    },
    {
      id: "anuncios",
      icon: "megaphone-outline",
      iconColor: "#9B59B6",
      label: "Preferências de anúncios",
      action: () => setShowAdPrefs(true),
    },
    {
      id: "avaliar",
      icon: "star-outline",
      iconColor: Colors.light.gold,
      label: "Avaliar aplicativo",
      action: handleRateApp,
    },
    {
      id: "sugestoes",
      icon: "chatbubble-ellipses-outline",
      iconColor: "#E67E22",
      label: "Enviar sugestões",
      action: () => router.push("/sugestoes"),
    },
  ];

  // ✅ Versão dinâmica via expo-constants
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={24} color={Colors.light.deepBlue} />
        </Pressable>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={styles.cross}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <Text style={styles.brandName}>Vivo em Deus</Text>
          <Text style={styles.brandSub}>Caminhando na Fé</Text>
        </View>

        <View style={styles.card}>
          {MENU_ITEMS.map((item, idx) => (
            <React.Fragment key={item.id}>
              <Pressable
                onPress={item.action}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && styles.menuRowPressed,
                ]}
                android_ripple={{ color: Colors.light.borderLight }}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.iconColor + "18" },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.light.textMuted}
                />
              </Pressable>
              {idx < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ✅ Versão dinâmica */}
        <Text style={styles.version}>Versão {appVersion}</Text>
      </ScrollView>

      <ConsentModal
        visible={showAdPrefs}
        onDone={() => setShowAdPrefs(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    backgroundColor: Colors.light.backgroundCard,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  content: {
    padding: 20,
    gap: 20,
  },
  brandRow: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  cross: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  crossV: {
    position: "absolute",
    width: 4,
    height: 36,
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
  },
  crossH: {
    position: "absolute",
    width: 24,
    height: 4,
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
    top: 9,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  brandSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  menuRowPressed: {
    backgroundColor: Colors.light.borderLight,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 76,
  },
  version: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
});

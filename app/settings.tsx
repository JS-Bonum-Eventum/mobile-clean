import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const SETTINGS_KEY = "vivo_em_deus_settings";

interface AppSettings {
  notificationsEnabled: boolean;
  notificationHour: number;
  largeText: boolean;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  notificationHour: 8,
  largeText: false,
  darkMode: false,
};

function SettingRow({
  icon,
  iconColor,
  title,
  subtitle,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  right: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + "20" }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((val) => {
      if (val) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(val) });
        } catch {
          // ignore
        }
      }
      setLoaded(true);
    });
  }, []);

  const saveSettings = async (updated: AppSettings) => {
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  const toggleNotifications = () => {
    saveSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  const toggleLargeText = () => {
    saveSettings({ ...settings, largeText: !settings.largeText });
  };

  const clearCache = async () => {
    Alert.alert(
      "Limpar cache",
      "Isso irá remover os dados de liturgia salvos. O app buscará novos dados na próxima abertura.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            const allKeys = await AsyncStorage.getAllKeys();
            const liturgyKeys = allKeys.filter((k) => k.startsWith("liturgia_"));
            await AsyncStorage.multiRemove(liturgyKeys);
            Alert.alert("Cache limpo", "Os dados serão atualizados na próxima abertura.");
          },
        },
      ]
    );
  };

  if (!loaded) return null;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.light.deepBlue} />
        </Pressable>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Notificações</Text>
        <View style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            iconColor={Colors.light.gold}
            title="Notificação diária"
            subtitle="Receba uma mensagem às 8h da manhã"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.gold }}
                thumbColor={Colors.light.white}
              />
            }
          />
        </View>

        <Text style={styles.sectionLabel}>Aparência</Text>
        <View style={styles.card}>
          <SettingRow
            icon="text-outline"
            iconColor="#7B68EE"
            title="Texto grande"
            subtitle="Aumenta o tamanho das orações e leituras"
            right={
              <Switch
                value={settings.largeText}
                onValueChange={toggleLargeText}
                trackColor={{ false: Colors.light.borderLight, true: "#7B68EE" }}
                thumbColor={Colors.light.white}
              />
            }
          />
        </View>

        <Text style={styles.sectionLabel}>Dados</Text>
        <View style={styles.card}>
          <Pressable onPress={clearCache} style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: "#E74C3C20" }]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Limpar cache</Text>
              <Text style={styles.settingSubtitle}>Remove dados de liturgia salvos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Sobre</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.light.deepBlue + "20" }]}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.light.deepBlue} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Versão</Text>
              <Text style={styles.settingSubtitle}>1.0.0</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: "#27AE6020" }]}>
              <Ionicons name="globe-outline" size={20} color="#27AE60" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Liturgia</Text>
              <Text style={styles.settingSubtitle}>liturgia.up.railway.app</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.crossSmall}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <Text style={styles.footerText}>Vivo em Deus</Text>
          <Text style={styles.footerSub}>Feito com fé e dedicação</Text>
        </View>
      </ScrollView>
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
  backBtn: {
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
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 72,
  },
  footer: {
    alignItems: "center",
    marginTop: 36,
    gap: 6,
  },
  crossSmall: {
    width: 20,
    height: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  crossV: {
    position: "absolute",
    width: 2,
    height: 20,
    backgroundColor: Colors.light.gold,
    borderRadius: 1,
  },
  crossH: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: Colors.light.gold,
    borderRadius: 1,
    top: 5,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
  footerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSettings } from "@/context/SettingsContext";  // Linha nova

export default function ReadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, reference, heading, content, aclamacaoRefrao, aclamacaoVersiculo } = useLocalSearchParams<{
    title: string;
    reference: string;
    heading: string;
    content: string;
    aclamacaoRefrao?: string;
    aclamacaoVersiculo?: string;
  }>();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { settings } = useSettings();  // Linha nova

  async function handleShare() {
    try {
      const appTag = "

🙏 Compartilhado pelo app Vivo em Deus";
      let texto = "";

      if (title === "Evangelho do Dia") {
        texto = "📖 Evangelho do Dia
";
        if (reference) texto += reference + "
";
        texto += "
";
        if (aclamacaoRefrao) texto += aclamacaoRefrao + "

";
        if (heading) texto += heading + "

";
        texto += content ?? "";
        texto += "

Palavra da Salvação
T. Glória a vós, Senhor";
      } else if (title === "Salmo Responsorial") {
        texto = "🎵 Salmo Responsorial
";
        if (reference) texto += reference + "

";
        texto += content ?? "";
      } else {
        texto = "📖 " + (title ?? "") + "
";
        if (reference) texto += reference + "

";
        if (heading) texto += heading + "

";
        texto += content ?? "";
      }

      await Share.share({ message: texto + appTag });
    } catch {}
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.deepBlue} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          {reference ? (
            <Text style={styles.headerRef}>{reference}</Text>
          ) : null}
        </View>
        <Pressable onPress={handleShare} style={styles.backButton}>
          <Ionicons name="share-social-outline" size={22} color={Colors.light.deepBlue} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ ACLAMAÇÃO — inserida aqui */}
        {title === "Evangelho do Dia" && (aclamacaoRefrao || aclamacaoVersiculo) && (
          <>
            <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
              Aclamação do Santo Evangelho
            </Text>
            {aclamacaoRefrao ? (
              <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
                {aclamacaoRefrao}
              </Text>
            ) : null}
            {aclamacaoVersiculo ? (
              <Text style={[styles.text, settings.largeText && styles.largeText]}>
                {aclamacaoVersiculo}
              </Text>
            ) : null}
            <View style={styles.divider} />
          </>
        )}

        {heading ? (
          <Text style={styles.heading}>{heading}</Text>
        ) : null}
        {title === "Evangelho do Dia" && (
          <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
            T. Glória a vós, Senhor
          </Text>
        )}
       <View style={styles.divider} />
       <Text style={[styles.text, settings.largeText && styles.largeText]}>
         {content}
       </Text>

       {(title === "1ª Leitura" || title === "2ª Leitura") && (
         <>
           <Text>{"\n"}</Text>
           <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
             Palavra do Senhor
           </Text>
           <Text>{"\n"}</Text>
           <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
             T. Graças a Deus
           </Text>
         </>
       )}

       {title === "Evangelho do Dia" && (
         <>
           <Text>{"\n"}</Text>
           <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
      Palavra da Salvação
           </Text>
           <Text style={[styles.closing, settings.largeText && styles.largeClosing]}>
             T. Glória a vós, Senhor
           </Text>
         </>
       )}
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  headerRef: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.gold,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  heading: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    lineHeight: 28,
    marginBottom: 12,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.light.gold,
    width: 48,
    borderRadius: 2,
    marginBottom: 20,
  },
  text: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 30,
  },
  largeText: {
    fontSize: 22,
    lineHeight: 38,
  },
  closing: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.text,
    lineHeight: 30,
  },
  largeClosing: {
    fontSize: 22,
    lineHeight: 38,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { saveConsent } from "@/services/consentService";

interface ConsentModalProps {
  visible: boolean;
  onDone: () => void;
}

export function ConsentModal({ visible, onDone }: ConsentModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleChoice = async (personalized: boolean) => {
    await saveConsent(personalized);
    onDone();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { paddingBottom: Math.max(bottomPad, 24) }]}>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={36} color={Colors.light.deepBlue} />
            </View>
          </View>

          <Text style={styles.title}>Privacidade e Anúncios</Text>

          <Text style={styles.body}>
            Utilizamos anúncios para manter este aplicativo gratuito e em constante melhoria.{"\n\n"}
            Alguns anúncios podem ser personalizados com base em seus interesses.{"\n\n"}
            Você pode escolher permitir ou não anúncios personalizados. Sua escolha não afetará sua experiência principal no aplicativo.{"\n\n"}
            Deseja permitir anúncios personalizados?
          </Text>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.btnPressed,
            ]}
            onPress={() => handleChoice(true)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.btnPrimaryText}>
              Permitir anúncios personalizados
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.btnSecondaryPressed,
            ]}
            onPress={() => handleChoice(false)}
          >
            <Text style={styles.btnSecondaryText}>
              Continuar com anúncios não personalizados
            </Text>
          </Pressable>

          <Text style={styles.footnote}>
            Você pode alterar sua preferência a qualquer momento no menu do aplicativo.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,20,45,0.72)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 24,
    gap: 14,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.deepBlue + "14",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
    textAlign: "left",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: 4,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.light.deepBlue,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center",
  },
  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  btnSecondaryPressed: {
    backgroundColor: Colors.light.borderLight,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  footnote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 17,
    paddingBottom: 8,
  },
});

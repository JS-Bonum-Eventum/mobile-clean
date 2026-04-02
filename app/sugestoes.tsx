import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

// 🔥 NOVO: função usando Vercel
const sendSuggestionEmail = async (
  nome: string,
  email: string,
  mensagem: string
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(
      "https://SEU-LINK.vercel.app/api/send-email", // 👈 TROCAR AQUI
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          mensagem,
        }),
      }
    );

    return { success: response.ok };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false };
  }
};

export default function SugestoesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Por favor, preencha todos os campos."
      );
      return;
    }

    setEnviando(true);
    try {
      const result = await sendSuggestionEmail(
        nome.trim(),
        email.trim(),
        mensagem.trim()
      );

      if (result.success) {
        setNome("");
        setEmail("");
        setMensagem("");
        setEnviado(true);
      } else {
        Alert.alert(
          "Erro ao enviar",
          "Erro ao enviar sua mensagem. Tente novamente."
        );
      }
    } catch {
      Alert.alert(
        "Erro ao enviar",
        "Erro ao enviar sua mensagem. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Android OK
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.light.deepBlue} />
          </Pressable>
          <Text style={styles.headerTitle}>Enviar sugestões</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPad + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {enviado ? (
            <View style={styles.successBox}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={56} color="#27AE60" />
              </View>
              <Text style={styles.successTitle}>Sua mensagem foi enviada!</Text>
              <Text style={styles.successText}>
                Agradecemos por sua sugestão!{"\n\n"}
                Revisaremos com muito carinho e atenção para aprimorar as próximas
                versões e proporcionar uma experiência ainda mais cativante no
                caminho da Fé.
              </Text>
              <Pressable
                onPress={() => {
                  setEnviado(false);
                  router.back();
                }}
                style={styles.voltarBtn}
              >
                <Ionicons name="arrow-back" size={18} color={Colors.light.deepBlue} />
                <Text style={styles.voltarBtnText}>Voltar ao aplicativo</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.intro}>
                <View style={styles.introIcon}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={32}
                    color={Colors.light.gold}
                  />
                </View>
                <Text style={styles.introTitle}>Fale conosco</Text>
                <Text style={styles.introText}>
                  Sua opinião é muito importante. Compartilhe ideias, sugestões ou
                  elogios para melhorarmos juntos.
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors.light.textMuted}
                  autoCapitalize="words"
                  returnKeyType="next"
                  editable={!enviando}
                />

                <Text style={styles.label}>E-mail *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  editable={!enviando}
                />

                <Text style={styles.label}>Mensagem *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={mensagem}
                  onChangeText={setMensagem}
                  placeholder="Escreva sua sugestão ou comentário..."
                  placeholderTextColor={Colors.light.textMuted}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  returnKeyType="default"
                  editable={!enviando}
                />

                <Pressable
                  onPress={handleEnviar}
                  disabled={enviando}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    pressed && { opacity: 0.85 },
                    enviando && { opacity: 0.6 },
                  ]}
                >
                  {enviando ? (
                    <Ionicons name="hourglass-outline" size={18} color={Colors.light.white} />
                  ) : (
                    <Ionicons name="send" size={18} color={Colors.light.white} />
                  )}
                  <Text style={styles.submitBtnText}>
                    {enviando ? "Enviando..." : "ENVIAR"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    padding: 20,
    gap: 24,
  },
  intro: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.light.gold + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  introText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 130,
    paddingTop: 13,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.light.deepBlue,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.white,
    letterSpacing: 1,
  },
  successBox: {
    alignItems: "center",
    gap: 20,
    paddingVertical: 32,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  successText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  voltarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginTop: 8,
  },
  voltarBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
});
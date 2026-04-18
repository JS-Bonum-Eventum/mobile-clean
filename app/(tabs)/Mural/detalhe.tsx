import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const CONTACT_EMAIL = "vivoemdeusvivo@gmail.com";

export default function DetalheMural() {
  const router = useRouter();

  function handleEmailPress() {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho com voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#1A237E" />
          <Text style={styles.backText}>Mural</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Ícone decorativo */}
        <Ionicons name="construct-outline" size={56} color="#C2185B" style={styles.icon} />

        <Text style={styles.title}>*** Em Construção ***</Text>

        <Text style={styles.text}>
          Em breve teremos material para divulgação neste Mural.
        </Text>

        <Text style={styles.text}>
          Se você tem uma banda, evento, show, serviço, produto ou alguma divulgação
          de cunho religioso e católico que queira compartilhar com a comunidade,
          você está no lugar certo!
        </Text>

        <Text style={styles.text}>
          Nos contate através do e-mail abaixo:
        </Text>

        <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7}>
          <Text style={styles.email}>{CONTACT_EMAIL}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A237E",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1A237E",
  },
  text: {
    fontSize: 16,
    marginBottom: 14,
    textAlign: "center",
    color: "#444",
    lineHeight: 24,
  },
  email: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

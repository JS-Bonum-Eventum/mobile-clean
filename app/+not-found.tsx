import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Página não encontrada" }} />
      {/* ✅ SafeAreaView para iOS — evita conteúdo atrás do notch */}
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Esta página não existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para o início</Text>
        </Link>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.light.cream,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: Colors.light.deepBlue,
    textDecorationLine: "underline",
  },
});

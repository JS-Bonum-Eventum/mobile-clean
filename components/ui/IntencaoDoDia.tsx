import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const INTENCAO_KEY = "vivo_em_deus_intencao";

const SUGESTOES_DIARIAS = [
  "Pela paz em minha família",
  "Pela saúde dos que eu amo",
  "Por um coração grato e humilde",
  "Pela proteção dos mais vulneráveis",
  "Por mais fé no caminho",
  "Pela conversão dos que estão longe de Deus",
  "Por força para superar os desafios de hoje",
];

function getSugestaoDoDia(): string {
  const idx = new Date().getDay();
  return SUGESTOES_DIARIAS[idx % SUGESTOES_DIARIAS.length];
}

export function IntencaoDoDia() {
  const [intencao, setIntencao] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(INTENCAO_KEY).then((val) => {
      if (val) {
        setIntencao(val);
      }
    });
  }, []);

  const handleSalvar = async () => {
    if (!intencao.trim()) return;
    await AsyncStorage.setItem(INTENCAO_KEY, intencao.trim());
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const handleLimpar = async () => {
    setIntencao("");
    setEditando(true);
    await AsyncStorage.removeItem(INTENCAO_KEY);
  };

  const sugestao = getSugestaoDoDia();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart" size={18} color="#E74C3C" />
        </View>
        <Text style={styles.title}>Intenção do Dia</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sugestaoLabel}>Sugestão de hoje:</Text>
        <Text style={styles.sugestaoText}>"{sugestao}"</Text>

        <View style={styles.divider} />

        {!editando && intencao ? (
          <View style={styles.savedRow}>
            <View style={styles.savedContent}>
              <Text style={styles.savedLabel}>Minha intenção/pedido para Deus:</Text>
              <Text style={styles.savedText}>{intencao}</Text>
            </View>
            <Pressable onPress={handleLimpar} style={styles.editBtn} hitSlop={8}>
              <Ionicons name="create-outline" size={18} color={Colors.light.deepBlue} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Digite sua intenção ou pedido de oração:
            </Text>
            <TextInput
              style={styles.input}
              value={intencao}
              onChangeText={(t) => {
                setIntencao(t);
                setEditando(true);
              }}
              placeholder={sugestao}
              placeholderTextColor={Colors.light.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setEditando(true)}
              returnKeyType="done"
              blurOnSubmit
            />
            <Pressable
              onPress={handleSalvar}
              disabled={!intencao.trim()}
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.8 },
                !intencao.trim() && { opacity: 0.4 },
              ]}
            >
              {salvo ? (
                <Ionicons name="checkmark" size={16} color={Colors.light.white} />
              ) : (
                <Ionicons name="save-outline" size={16} color={Colors.light.white} />
              )}
              <Text style={styles.saveBtnText}>
                {salvo ? "Salvo!" : "Salvar intenção"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E74C3C18",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  sugestaoLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  sugestaoText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  savedContent: {
    flex: 1,
    gap: 4,
  },
  savedLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  savedText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 20,
  },
  editBtn: {
    padding: 4,
  },
  inputSection: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  input: {
    backgroundColor: Colors.light.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    minHeight: 80,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.deepBlue,
    borderRadius: 12,
    paddingVertical: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.white,
  },
});

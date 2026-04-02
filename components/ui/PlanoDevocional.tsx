import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  TEMAS,
  TEMA_COLORS,
  TEMA_ICONS,
  getPlanoDevocional,
  type Tema,
  type DiaDevocional,
} from "@/services/devocionaisService";

function DiaCard({ dia, accentColor }: { dia: DiaDevocional; accentColor: string }) {
  const [open, setOpen] = useState(false);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggle = () => {
    scale.value = withSpring(0.97, {}, () => {
      scale.value = withSpring(1);
    });
    setOpen((p) => !p);
  };

  return (
    <Animated.View style={[styles.diaCard, animStyle]}>
      <Pressable onPress={toggle} style={styles.diaHeader}>
        <View style={[styles.diaBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.diaBadgeText}>{dia.dia}</Text>
        </View>
        <Text style={styles.diaTitulo}>{dia.titulo}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.light.textMuted}
        />
      </Pressable>

      {open && (
        <View style={styles.diaBody}>
          <Text style={styles.reflexao}>{dia.reflexao}</Text>

          <View style={styles.referencias}>
            <View style={styles.refRow}>
              <View style={[styles.refIcon, { backgroundColor: accentColor + "18" }]}>
                <Ionicons name="book-outline" size={14} color={accentColor} />
              </View>
              <View>
                <Text style={styles.refLabel}>Leitura Bíblica</Text>
                <Text style={styles.refValue}>{dia.leitura}</Text>
              </View>
            </View>

            <View style={styles.refRow}>
              <View style={[styles.refIcon, { backgroundColor: accentColor + "18" }]}>
                <Ionicons name="musical-notes-outline" size={14} color={accentColor} />
              </View>
              <View>
                <Text style={styles.refLabel}>Salmo</Text>
                <Text style={styles.refValue}>{dia.salmo}</Text>
              </View>
            </View>

            <View style={styles.refRow}>
              <View style={[styles.refIcon, { backgroundColor: accentColor + "18" }]}>
                <Ionicons name="sparkles-outline" size={14} color={accentColor} />
              </View>
              <View>
                <Text style={styles.refLabel}>Provérbio</Text>
                <Text style={styles.refValue}>{dia.proverbio}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

export function PlanoDevocional() {
  const [temaSelecionado, setTemaSelecionado] = useState<Tema | null>(null);

  const handleSelectTema = (tema: Tema) => {
    setTemaSelecionado((prev) => (prev === tema ? null : tema));
  };

  const plano = temaSelecionado ? getPlanoDevocional(temaSelecionado) : null;
  const accentColor = temaSelecionado
    ? TEMA_COLORS[temaSelecionado]
    : Colors.light.deepBlue;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color={Colors.light.deepBlue}
        />
        <Text style={styles.sectionTitle}>Plano Devocional de Fé</Text>
      </View>
      <Text style={styles.sectionSub}>
        Escolha um tema e receba um plano de 7 dias
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.temasList}
      >
        {TEMAS.map((tema) => {
          const selected = temaSelecionado === tema;
          const color = TEMA_COLORS[tema];
          return (
            <Pressable
              key={tema}
              onPress={() => handleSelectTema(tema)}
              style={[
                styles.temaChip,
                selected && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text style={styles.temaEmoji}>{TEMA_ICONS[tema]}</Text>
              <Text
                style={[styles.temaLabel, selected && styles.temaLabelSelected]}
              >
                {tema}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {plano && (
        <View style={styles.planoContainer}>
          <View
            style={[styles.planoHeader, { backgroundColor: accentColor + "15" }]}
          >
            <Text style={styles.planoEmoji}>
              {TEMA_ICONS[temaSelecionado!]}
            </Text>
            <View>
              <Text style={[styles.planoTema, { color: accentColor }]}>
                {temaSelecionado}
              </Text>
              <Text style={styles.planoDias}>7 dias de devoção</Text>
            </View>
          </View>

          {plano.map((dia) => (
            <DiaCard key={dia.dia} dia={dia} accentColor={accentColor} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginBottom: 14,
  },
  temasList: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 4,
  },
  temaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
  },
  temaEmoji: {
    fontSize: 15,
  },
  temaLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  temaLabelSelected: {
    color: Colors.light.white,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
  },
  planoContainer: {
    marginTop: 16,
    gap: 8,
  },
  planoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  planoEmoji: {
    fontSize: 28,
  },
  planoTema: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
  },
  planoDias: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  diaCard: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: "hidden",
  },
  diaHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  diaBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  diaBadgeText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.white,
  },
  diaTitulo: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  diaBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    paddingTop: 14,
  },
  reflexao: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 21,
  },
  referencias: {
    gap: 10,
  },
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  refIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  refLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  refValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
});

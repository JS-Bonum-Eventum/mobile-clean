import React from "react";
import { useState } from "react";
import { getMysteryOfDay } from "@/utils/rosaryMysteries";
import { generateRosaryFlow } from "@/utils/rosaryFlow";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { RealisticRosary } from "@/components/RealisticRosary";
import { useRosary  } from "@/context/RosaryContext";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export default function TercoScreen() {
  const mystery = getMysteryOfDay();
  const steps = generateRosaryFlow(
  mystery.items,
  mystery.meditations
);

  const [stepIndex, setStepIndex] = useState(0);
  const { beads, active, current, toggle, next, reset } = useRosary();

  function handlePress(i: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(i);
  }

  function nextStep() {
    const step = steps[stepIndex];

    // 👉 só avança conta se tiver conta
    if (step.hasBead) {
      next();
    }

    // 👉 sempre avança oração
    setStepIndex((prev) => {
      if (prev < steps.length - 1) return prev + 1;
      return prev;
    });
  }

  const currentType = beads[current];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5efe6" }}>
      
      <RealisticRosary
        beads={beads}
        active={active}
        current={current}
        onPress={handlePress}
        width={width}
        height={height * 0.75}
      />

      {/* Texto da oração */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
  
        {/* Tipo de mistério */}
        <Text style={{ fontSize: 14, color: "#666" }}>
          {mystery.title}
        </Text>

        {/* Passo atual */}
        <Text style={{ fontSize: 20, fontWeight: "600", marginTop: 6 }}>
          {steps[stepIndex].label}
        </Text>

        {steps[stepIndex].type === "misterio" &&
          steps[stepIndex].meditation && (
            <Text
              style={{
                marginTop: 8,
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              {steps[stepIndex].meditation}
            </Text>
        )}

      </View>

      {/* Controles */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 20,
        }}
      >
        <TouchableOpacity onPress={nextStep}>
          <Text>Avançar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            reset();        // reseta as contas
            setStepIndex(0); // volta para o início do terço
          }}
        >
          <Text>Resetar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
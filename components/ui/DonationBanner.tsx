import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

export function DonationBanner() {
  const scale = useSharedValue(1);
  const router = useRouter();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/doacao");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.crossIcon}>
        <View style={styles.crossV} />
        <View style={styles.crossH} />
      </View>
      <Text style={styles.message}>
        Se este aplicativo te ajuda a se aproximar de Deus, considere apoiar
        este serviço com uma oferta
      </Text>
      <Animated.View style={animStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
        >
          <Ionicons name="heart" size={18} color={Colors.light.deepBlue} />
          <Text style={styles.buttonText}>Apoiar o projeto</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.light.deepBlue,
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
    alignItems: "center",
    gap: 14,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  crossIcon: {
    width: 28,
    height: 28,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  crossV: {
    position: "absolute",
    width: 3,
    height: 28,
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
  },
  crossH: {
    position: "absolute",
    width: 18,
    height: 3,
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
    top: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.gold,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.light.gold,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
});

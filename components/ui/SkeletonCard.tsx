import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

function SkeletonItem({ width, height }: { width: string | number; height: number }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        animStyle,
        { width: width as number, height },
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <SkeletonItem width="40%" height={14} />
        <SkeletonItem width="60%" height={12} />
        <SkeletonItem width="100%" height={16} />
        <SkeletonItem width="90%" height={16} />
        <SkeletonItem width="75%" height={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 4,
    backgroundColor: Colors.light.borderLight,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  skeleton: {
    backgroundColor: Colors.light.border,
    borderRadius: 6,
  },
});

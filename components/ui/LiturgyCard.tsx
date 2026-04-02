import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

interface LiturgyCardProps {
  title: string;
  reference?: string;
  content?: string;
  icon?: ReactNode;
  onPress?: () => void;
  accentColor?: string;
  style?: ViewStyle;
  compact?: boolean;
  children?: ReactNode;
}

export function LiturgyCard({
  title,
  reference,
  content,
  icon,
  onPress,
  accentColor = Colors.light.gold,
  style,
  compact = false,
  children,
}: LiturgyCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.97, { damping: 20 });
  };
  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, { damping: 20 });
  };

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          pressed && onPress ? styles.cardPressed : null,
        ]}
      >
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <View style={styles.titleArea}>
              <Text style={styles.title}>{title}</Text>
              {reference ? (
                <Text style={[styles.reference, { color: accentColor }]}>
                  {reference}
                </Text>
              ) : null}
            </View>
          </View>
          {content ? (
            <Text
              style={[styles.text, compact ? styles.textCompact : null]}
              numberOfLines={compact ? 3 : undefined}
            >
              {content}
            </Text>
          ) : null}
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  cardPressed: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  accentBar: {
    width: 4,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconWrap: {
    marginTop: 2,
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  reference: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
  },
  text: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 26,
  },
  textCompact: {
    fontSize: 15,
    lineHeight: 22,
  },
});

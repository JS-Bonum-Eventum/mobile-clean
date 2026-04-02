import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function ReadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, reference, heading, content } = useLocalSearchParams<{
    title: string;
    reference: string;
    heading: string;
    content: string;
  }>();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.deepBlue} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          {reference ? (
            <Text style={styles.headerRef}>{reference}</Text>
          ) : null}
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {heading ? (
          <Text style={styles.heading}>{heading}</Text>
        ) : null}
        <View style={styles.divider} />
        <Text style={styles.text}>{content}</Text>
      </ScrollView>
    </View>
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
  },
  headerRef: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.gold,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  heading: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    lineHeight: 28,
    marginBottom: 12,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.light.gold,
    width: 48,
    borderRadius: 2,
    marginBottom: 20,
  },
  text: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 30,
  },
});

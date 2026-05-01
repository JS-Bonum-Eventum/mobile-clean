import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";

const TAB_ACTIVE   = Colors.light.deepBlue;
const TAB_INACTIVE = "#8AACC8";

// ── NativeTabLayout (iOS Liquid Glass) ───────────────────────────
function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Início</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="evangelho">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Evangelho</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="leituras">
        <Icon sf={{ default: "text.book.closed", selected: "text.book.closed.fill" }} />
        <Label>Leituras</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="biblia">
        <Icon sf={{ default: "book.closed", selected: "book.closed.fill" }} />
        <Label>Bíblia</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="oracoes">
        <Icon sf={{ default: "hands.sparkles", selected: "hands.sparkles.fill" }} />
        <Label>Orações</Label>
      </NativeTabs.Trigger>
      {/* Mural: apenas 1 ícone no menu — detalhe é rota interna, não aba */}
      <NativeTabs.Trigger name="mural">
        <Icon sf={{ default: "clipboard", selected: "clipboard.fill" }} />
        <Label>Mural</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// ── ClassicTabLayout (Android / Web / iOS sem Liquid Glass) ──────
function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.light.backgroundCard,
          borderTopWidth:  isWeb ? 1 : 0,
          borderTopColor:  Colors.light.borderLight,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.light.backgroundCard }]} />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) =>
            isIOS
              ? <SymbolView name="house.fill" tintColor={color} size={22} />
              : <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="evangelho"
        options={{
          title: "Evangelho",
          tabBarIcon: ({ color }) =>
            isIOS
              ? <SymbolView name="book.fill" tintColor={color} size={22} />
              : <Ionicons name="book" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leituras"
        options={{
          title: "Leituras",
          tabBarIcon: ({ color }) =>
            isIOS
              ? <SymbolView name="text.book.closed" tintColor={color} size={22} />
              : <Ionicons name="book-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="biblia"
        options={{
          title: "Bíblia",
          tabBarIcon: ({ color }) =>
            isIOS
              ? <SymbolView name="book.closed.fill" tintColor={color} size={22} />
              : <MaterialCommunityIcons name="book-cross" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="oracoes"
        options={{
          title: "Orações",
          tabBarIcon: ({ color }) =>
            isIOS
              ? <SymbolView name="hands.sparkles" tintColor={color} size={22} />
              : <MaterialCommunityIcons name="hands-pray" size={22} color={color} />,
        }}
      />

      {/* ── Mural: reseta stack ao clicar na tab (inclusive pelo More screen) ── */}
      <Tabs.Screen
        name="mural"
        options={{
          title: "Mural",
          tabBarIcon: ({ color, size }) =>
            isIOS
              ? <SymbolView name="clipboard.fill" tintColor={color} size={22} />
              : <Ionicons name="clipboard-outline" size={size} color={color} />,
        }}
        listeners={({ navigation }) => ({
          // ✅ Sempre que a tab Mural for pressionada (inclusive pelo "..."),
          // reseta o stack para o index, evitando restaurar tela antiga
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: "mural" }],
            });
          },
        })}
      />

      {/*
        detalhe NÃO aparece como aba.
        É uma rota interna da pasta mural, acessada via router.push('/mural/detalhe').
        O tabBarButton: () => null garante que não apareça nenhum ícone extra na barra.
      */}
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({});

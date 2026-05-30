// 🔹 Bibliotecas externas
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

// 🔹 React / React Native
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";

// 🔹 Tracking Transparency (iOS apenas)
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from "expo-tracking-transparency";

// 🔹 Internos (seu projeto)
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LiturgyProvider } from "@/context/LiturgyContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { RosaryProvider } from "@/context/RosaryContext";
import { getConsentState } from "@/services/consentService";
import { ConsentModal } from "@/components/ui/ConsentModal";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="reading"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="doacao"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="menu"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="info"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="sugestoes"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="terco"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [consentReady, setConsentReady] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === "web") {
      setConsentReady(true);
      return;
    }

    if (Platform.OS === "ios") {
      // ✅ iOS: NÃO mostra ConsentModal customizado (viola guideline 5.1.2)
      // A ordem correta no iOS é: ATT → Notificação (sem modal customizado)
      setConsentReady(true);
      return;
    }

    // Android: mantém o ConsentModal customizado normalmente
    getConsentState().then((state) => {
      if (!state?.given) {
        setShowConsent(true);
      }
      setConsentReady(true);
    });
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    if (Platform.OS === "ios") {
      // ✅ iOS: ATT PRIMEIRO (exigência Apple guideline 5.1.2)
      // Delay garante que o app está completamente carregado antes de pedir ATT
      // Verificação do status atual evita chamar se já foi respondido
      const requestATT = async () => {
        try {
          // Verifica status atual
          const { status: currentStatus } = await getTrackingPermissionsAsync();
          if (currentStatus === "undetermined") {
            // Ainda não respondido — mostra o dialog nativo
            await requestTrackingPermissionsAsync();
          }
        } catch {
          // Falha silenciosa
        } finally {
          // Notificação sempre solicitada após ATT (independente do resultado)
          Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowSound: true,
              allowBadge: true,
            },
          });
        }
      };
      // ✅ Delay de 500ms — garante app carregado antes do dialog ATT
      setTimeout(requestATT, 500);
    }
  }, []);

  if ((!fontsLoaded && !fontError) || !consentReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <RosaryProvider>
              <LiturgyProvider>
                {/* ✅ style={{ flex: 1 }} necessário para layout correto no iOS */}
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                    <ConsentModal
                      visible={showConsent}
                      onDone={() => setShowConsent(false)}
                    />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </LiturgyProvider>
            </RosaryProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

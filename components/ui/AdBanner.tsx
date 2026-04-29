import { NativeModules } from "react-native"; // 🔵 ADICIONADO: detectar Expo Go
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";

// ─────────────────────────────────────────────────────────────────
//  ⚠️  AdMob NÃO funciona no Expo Go nem no simulador.
//  Para testar: use um APK/IPA gerado via EAS Build (profile preview).
//  Em desenvolvimento (__DEV__) usa os IDs de teste do Google.
// ─────────────────────────────────────────────────────────────────

const ANDROID_BANNER_ID = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"   // ID de teste Google
  : "ca-app-pub-5641296358964370/2930794595";  // ← seu ID Android produção

const IOS_BANNER_ID = __DEV__
  ? "ca-app-pub-3940256099942544/2934735716"   // ID de teste Google para iOS
  : "ca-app-pub-5641296358964370/6861111373";  // ← criar no AdMob e substituir

export function AdBanner() {
  const isExpoGo = !NativeModules.RNGoogleMobileAdsModule; // 🔵 ADICIONADO: verifica se AdMob está disponível

  if (__DEV__ || isExpoGo) {
    // 🔵 ADICIONADO: bloqueia AdMob no Expo Go / dev
    return <View style={styles.placeholder} />;
  }

  const [BannerAd, setBannerAd] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let retryTimer: ReturnType<typeof setTimeout>;

    async function loadAds() {
      try {
        const ads = await import("react-native-google-mobile-ads");

        if (!mounted) return;

        // Verifica se o módulo nativo está disponível
        // (não disponível no Expo Go — requer build nativo)
        if (!ads?.BannerAd || !ads?.BannerAdSize) {
          console.log("AdMob: módulo nativo ainda não disponível, tentando novamente...");
          if (retryCount < 5) {
            retryTimer = setTimeout(() => {
              if (mounted) setRetryCount((c) => c + 1);
            }, 1000);
          }
          return;
        }

        setBannerAd(() => ads.BannerAd);
        setBannerAdSize(ads.BannerAdSize);

        // Pequeno delay evita crash do Fabric
        setTimeout(() => {
          if (mounted) setLoaded(true);
        }, 500);

      } catch (e) {
        console.log("AdMob load error:", e);
        if (retryCount < 5) {
          retryTimer = setTimeout(() => {
            if (mounted) setRetryCount((c) => c + 1);
          }, 1000);
        }
      }
    }

    loadAds();

    return () => {
      mounted = false;
      clearTimeout(retryTimer);
    };
  }, [retryCount]);

  if (!loaded || !BannerAd || !BannerAdSize) {
    return <View style={styles.placeholder} />;
  }

  // ✅ ID correto por plataforma
  const adUnitId = Platform.OS === "ios" ? IOS_BANNER_ID : ANDROID_BANNER_ID;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={(error: any) => {
          console.log("AdMob error:", error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  placeholder: {
    height: 0,
  },
});

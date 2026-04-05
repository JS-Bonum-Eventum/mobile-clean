import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Constants from "expo-constants";

const ANDROID_BANNER_ID = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : "ca-app-pub-5641296358964370/2930794595";

const IOS_BANNER_ID = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : "ca-app-pub-5641296358964370/2930794595";

const isExpoGo = Constants.executionEnvironment === "storeClient";

export function AdBanner() {
  const [BannerAd, setBannerAd] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);
  const [personalized, setPersonalized] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // carrega ads
        if (!isExpoGo) {
          const ads = await import("react-native-google-mobile-ads");
          setBannerAd(() => ads.BannerAd);
          setBannerAdSize(ads.BannerAdSize);
        }

        // consentimento
        const { getConsentState } = await import("@/services/consentService");
        const state = await getConsentState();

        setPersonalized(state?.personalized ?? false);

        // 🔥 só libera render quando tudo pronto
        setReady(true);
      } catch (e) {
        console.log("Ads init error:", e);
        setReady(false);
      }
    }

    init();
  }, []);

  // 🚫 NÃO renderiza nada até tudo estar pronto
  if (!ready || !BannerAd || !BannerAdSize) {
    return <View style={styles.placeholder} />;
  }

  const adUnitId =
    Platform.OS === "ios" ? IOS_BANNER_ID : ANDROID_BANNER_ID;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !personalized,
        }}
        onAdFailedToLoad={(error: any) => {
          console.log("Ad error:", error);
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
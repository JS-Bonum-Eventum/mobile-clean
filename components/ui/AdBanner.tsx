import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Constants from "expo-constants";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const ANDROID_BANNER_ID = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : "ca-app-pub-5641296358964370/2930794595";

const IOS_BANNER_ID = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : "ca-app-pub-5641296358964370/2930794595";

const isExpoGo = Constants.executionEnvironment === "storeClient";

function NativeBanner() {
  const [personalized, setPersonalized] = React.useState<boolean | null>(null);

  useEffect(() => {
    // 🔒 Mantém apenas consentimento (sem carregar Ads)
    import("@/services/consentService")
      .then(({ getConsentState }) => getConsentState())
      .then((state) => {
        setPersonalized(state?.personalized ?? false);
      })
      .catch(() => setPersonalized(false));
  }, []);

  // 🚫 ADS DESATIVADO TEMPORARIAMENTE
  // Isso evita o crash do app no Android
  return <View style={styles.placeholder} />;
}

function WebBanner() {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {}
  }, []);

  return (
    <View style={styles.webContainer}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5641296358964370"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </View>
  );
}

export function AdBanner() {
  if (Platform.OS === "web") {
    return <WebBanner />;
  }
  return <NativeBanner />;
}

const styles = StyleSheet.create({
  nativeContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  webContainer: {
    marginVertical: 12,
    alignItems: "center",
    minHeight: 60,
  },
  placeholder: {
    height: 0,
  },
});
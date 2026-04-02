import AsyncStorage from "@react-native-async-storage/async-storage";

const CONSENT_KEY = "vivo_em_deus_ad_consent_v1";

export interface ConsentState {
  given: boolean;
  personalized: boolean;
}

export async function getConsentState(): Promise<ConsentState | null> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export async function saveConsent(personalized: boolean): Promise<void> {
  try {
    const state: ConsentState = { given: true, personalized };
    await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
  }
}

export async function resetConsent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONSENT_KEY);
  } catch {
  }
}

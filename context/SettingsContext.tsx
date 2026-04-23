// context/SettingsContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "Meu_APP_settings";

interface AppSettings {
  notificationsEnabled: boolean;
  notificationHour: number;
  largeText: boolean;
  darkMode: boolean;  // ℹ️ iOS: se usar useColorScheme() em paralelo, pode conflitar com o dark mode do sistema
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notificationHour: 8,
  largeText: false,
  darkMode: false,
};

interface SettingsContextType {
  settings: AppSettings;
  saveSettings: (s: AppSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  saveSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((val) => {
      if (val) {
        try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(val) }); }
        catch {}
      }
    });
  }, []);

  const saveSettings = async (updated: AppSettings) => {
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
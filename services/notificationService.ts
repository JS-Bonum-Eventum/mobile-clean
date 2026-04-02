import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const NOTIFICATION_SCHEDULED_KEY = "notification_scheduled_date_v2";

const isExpoGo = Constants.executionEnvironment === "storeClient";

const DAILY_MESSAGES = [
  {
    title: "Vivo em Deus",
    body: "🙏 Comece seu dia com Deus",
  },
  {
    title: "Vivo em Deus",
    body: "📖 O Evangelho do dia já está disponível",
  },
  {
    title: "Vivo em Deus",
    body: "✨ Reserve um momento com Deus hoje",
  },
  {
    title: "Vivo em Deus",
    body: "🙏 Comece seu dia com Deus — a liturgia de hoje já está disponível.",
  },
  {
    title: "Vivo em Deus",
    body: "✨ Reserve um momento com Deus hoje. A sua alma agradece.",
  },
];

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web" || isExpoGo) return false;
  try {
    const Notifications = await import("expo-notifications");
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleDailyNotification(): Promise<void> {
  if (Platform.OS === "web" || isExpoGo) return;
  try {
    const today = new Date().toDateString();
    const lastScheduled = await AsyncStorage.getItem(
      NOTIFICATION_SCHEDULED_KEY
    );
    if (lastScheduled === today) return;

    const Notifications = await import("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowList: true,
      }),
    });

    await Notifications.cancelAllScheduledNotificationsAsync();

    const randomMsg =
      DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

    await Notifications.scheduleNotificationAsync({
      content: { title: randomMsg.title, body: randomMsg.body },
      trigger: { hour: 8, minute: 0, repeats: true } as never,
    });

    await AsyncStorage.setItem(NOTIFICATION_SCHEDULED_KEY, today);
  } catch {
    // silently fail — notifications are non-critical
  }
}

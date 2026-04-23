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
    const { status } = await Notifications.requestPermissionsAsync({
      // ✅ Especificar permissões iOS explicitamente
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
      },
    });
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleDailyNotification(): Promise<void> {
  if (Platform.OS === "web" || isExpoGo) return;
  try {
    // ✅ Verificar permissão antes de agendar
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const today = new Date().toDateString();
    const lastScheduled = await AsyncStorage.getItem(
      NOTIFICATION_SCHEDULED_KEY
    );
    if (lastScheduled === today) return;

    const Notifications = await import("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,   // ✅ obrigatório no iOS
        shouldShowBanner: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowList: true,
      }),
    });

    await Notifications.cancelAllScheduledNotificationsAsync();

    const randomMsg =
      DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

    // ✅ Trigger tipado corretamente — sem cast "as never"
    await Notifications.scheduleNotificationAsync({
      content: { title: randomMsg.title, body: randomMsg.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      } as Notifications.DailyTriggerInput,
    });

    await AsyncStorage.setItem(NOTIFICATION_SCHEDULED_KEY, today);
  } catch {
    // silently fail — notifications are non-critical
  }
}

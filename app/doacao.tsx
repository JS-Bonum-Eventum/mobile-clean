import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import Colors from "@/constants/colors";

const PIX_KEY = "492edb47-bbff-464c-82a1-10b4f356a939";
const PAYPAL_URL = "https://www.paypal.com/donate/?hosted_button_id=4GWQS9A5XNRTE";

async function openExternalLink(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

const DONATION_OPTIONS = [
  { label: "R$15", value: 15 },
  { label: "R$30", value: 30 },
  { label: "R$60", value: 60 },
  { label: "R$90", value: 90 },
  { label: "OUTRO", value: "outro" as const },
];

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload(pixKey: string, amount?: number): string {
  const f = (id: string, val: string) =>
    `${id}${String(val.length).padStart(2, "0")}${val}`;
  const merchantInfo = f("00", "BR.GOV.BCB.PIX") + f("01", pixKey);
  const name = "VIVO EM DEUS";
  const city = "BRASIL";
  const parts: string[] = [
    f("00", "01"),
    f("01", "12"),
    f("26", merchantInfo),
    f("52", "0000"),
    f("53", "986"),
  ];
  if (amount && amount >= 15) {
    parts.push(f("54", amount.toFixed(2)));
  }
  parts.push(f("58", "BR"), f("59", name), f("60", city), "6304");
  const payload = parts.join("");
  return payload + crc16(payload);
}

export default function DoacaoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [copied, setCopied] = React.useState(false);
  const [selectedAmount, setSelectedAmount] = React.useState<number | "outro" | null>(null);
  const [customAmount, setCustomAmount] = React.useState("");
  const [customError, setCustomError] = React.useState("");
  const [paypalLoading, setPaypalLoading] = React.useState(false);

  const resolvedAmount = React.useMemo(() => {
    if (selectedAmount === "outro") {
      const v = parseFloat(customAmount.replace(",", "."));
      return isNaN(v) ? undefined : v;
    }
    return selectedAmount ?? undefined;
  }, [selectedAmount, customAmount]);

  const pixPayload = React.useMemo(
    () => buildPixPayload(PIX_KEY, resolvedAmount),
    [resolvedAmount]
  );

  const handleSelectAmount = (value: number | "outro") => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedAmount(value);
    setCustomAmount("");
    setCustomError("");
  };

  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9,\.]/g, "");
    setCustomAmount(cleaned);
    const v = parseFloat(cleaned.replace(",", "."));
    if (!isNaN(v) && v < 15) {
      setCustomError("O valor mínimo para doação é R$15,00");
    } else {
      setCustomError("");
    }
  };

  const handleCopyPix = async () => {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayPal = () => {
    Alert.alert(
      "Apoiar o projeto",
      "Você será redirecionado com segurança para o PayPal para concluir sua doação.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          onPress: async () => {
            if (Platform.OS !== "web") {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setPaypalLoading(true);
            await new Promise((r) => setTimeout(r, 500));
            const success = await openExternalLink(PAYPAL_URL);
            setPaypalLoading(false);
            if (!success) {
              Alert.alert(
                "Não foi possível abrir o PayPal",
                "Verifique sua conexão e tente novamente."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={22} color={Colors.light.deepBlue} />
          </Pressable>
          <Text style={styles.headerTitle}>Apoiar o Projeto</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart" size={48} color={Colors.light.gold} />
            </View>
            <Text style={styles.heroTitle}>Apoiar o Projeto</Text>
            <Text style={styles.heroText}>
              O Vivo em Deus é um aplicativo gratuito, desenvolvido com dedicação
              para ajudar na vivência da fé católica no dia a dia.{"\n\n"}
              Sua contribuição é totalmente voluntária e nos ajuda a manter o
              aplicativo, melhorar funcionalidades e continuar oferecendo conteúdo
              espiritual de qualidade.{"\n\n"}
              Não há qualquer obrigação de pagamento para utilizar o aplicativo.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Escolha um valor</Text>
          <View style={styles.amountRow}>
            {DONATION_OPTIONS.map((opt) => {
              const isSelected = selectedAmount === opt.value;
              return (
                <Pressable
                  key={String(opt.value)}
                  onPress={() => handleSelectAmount(opt.value)}
                  style={({ pressed }) => [
                    styles.amountBtn,
                    isSelected && styles.amountBtnSelected,
                    opt.value === "outro" && styles.amountBtnOther,
                    opt.value === "outro" && isSelected && styles.amountBtnOtherSelected,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text
                    style={[
                      styles.amountBtnLabel,
                      isSelected && styles.amountBtnLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedAmount === "outro" && (
            <View style={styles.customBox}>
              <Text style={styles.customHint}>
                Digite o valor da doação
              </Text>
              <View style={[styles.customInputRow, customError ? styles.customInputRowError : null]}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.customInput}
                  keyboardType="decimal-pad"
                  placeholder="Valor mínimo: R$15,00"
                  placeholderTextColor={Colors.light.textMuted}
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  returnKeyType="done"
                />
              </View>
              {customError !== "" && (
                <Text style={styles.customError}>{customError}</Text>
              )}
            </View>
          )}

          {selectedAmount !== null && selectedAmount !== "outro" && (
            <View style={styles.selectedInfo}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
              <Text style={styles.selectedInfoText}>
                Valor selecionado:{" "}
                <Text style={styles.selectedInfoBold}>
                  R${(selectedAmount as number).toFixed(2).replace(".", ",")}
                </Text>
              </Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>Pagamento via PIX</Text>
          <View style={styles.pixCard}>
            <View style={styles.pixQrArea}>
              {Platform.OS !== "web" ? (
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={pixPayload}
                    size={200}
                    color={Colors.light.deepBlue}
                    backgroundColor={Colors.light.white}
                  />
                  <Text style={styles.qrCaption}>
                    Escaneie o QR Code com o app do seu banco
                  </Text>
                  {resolvedAmount && resolvedAmount >= 15 && (
                    <Text style={styles.qrAmount}>
                      Valor: R${resolvedAmount.toFixed(2).replace(".", ",")}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.pixQrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={64} color={Colors.light.textMuted} />
                  <Text style={styles.pixQrText}>QR Code PIX</Text>
                  <Text style={styles.pixQrSub}>
                    Abra no celular para escanear
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.pixKeyRow}>
              <View style={styles.pixKeyBox}>
                <Text style={styles.pixKeyLabel}>Chave Pix</Text>
                <Text style={styles.pixKeyValue} numberOfLines={1} ellipsizeMode="middle">
                  {PIX_KEY}
                </Text>
              </View>
              <Pressable onPress={handleCopyPix} style={styles.copyBtn}>
                <Ionicons
                  name={copied ? "checkmark-outline" : "copy-outline"}
                  size={18}
                  color={copied ? Colors.light.success : Colors.light.deepBlue}
                />
                <Text style={[styles.copyText, copied && { color: Colors.light.success }]}>
                  {copied ? "Copiado!" : "Copiar"}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Ou contribua via PayPal</Text>
          <Pressable
            onPress={handlePayPal}
            disabled={paypalLoading}
            accessibilityLabel="Apoiar o projeto via PayPal"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.altButton,
              pressed && { opacity: 0.8 },
              paypalLoading && { opacity: 0.65 },
            ]}
          >
            <View style={styles.altIcon}>
              {paypalLoading ? (
                <ActivityIndicator size="small" color="#003087" />
              ) : (
                <Ionicons name="card-outline" size={24} color="#003087" />
              )}
            </View>
            <View style={styles.altText}>
              <Text style={styles.altTitle}>
                {paypalLoading ? "Abrindo PayPal..." : "PayPal"}
              </Text>
              <Text style={styles.altSub}>Doação via cartão ou saldo PayPal</Text>
            </View>
            {!paypalLoading && (
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />
            )}
          </Pressable>
          <Text style={styles.paypalDisclaimer}>
            Sua contribuição é totalmente voluntária e ajuda a manter o aplicativo ativo 🙏
          </Text>

          <View style={styles.thankYouBox}>
            <View style={styles.crossSmall}>
              <View style={styles.crossV} />
              <View style={styles.crossH} />
            </View>
            <Text style={styles.thankYouText}>
              "Cada um dê conforme determinou em seu coração, não com tristeza nem
              por obrigação, porque Deus ama quem dá com alegria."
            </Text>
            <Text style={styles.thankYouRef}>2 Coríntios 9,7</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  content: {
    padding: 16,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  heartCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.gold + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  heroText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  amountBtn: {
    flex: 1,
    minWidth: 56,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  amountBtnSelected: {
    borderColor: Colors.light.deepBlue,
    backgroundColor: Colors.light.deepBlue,
    shadowOpacity: 0.18,
    elevation: 4,
  },
  amountBtnOther: {
    borderColor: Colors.light.gold,
  },
  amountBtnOtherSelected: {
    borderColor: Colors.light.gold,
    backgroundColor: Colors.light.gold,
  },
  amountBtnLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
  amountBtnLabelSelected: {
    color: "#FFFFFF",
  },
  customBox: {
    marginTop: 12,
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.gold + "60",
  },
  customHint: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.textSecondary,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    gap: 6,
  },
  customInputRowError: {
    borderColor: "#E74C3C",
  },
  currencyPrefix: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
    padding: 0,
  },
  customError: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#E74C3C",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.light.success + "15",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedInfoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  selectedInfoBold: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
  },
  pixCard: {
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  pixQrArea: {
    alignItems: "center",
  },
  qrWrapper: {
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  qrCaption: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  qrAmount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  pixQrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pixQrText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
  },
  pixQrSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  pixKeyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
  },
  pixKeyBox: {
    flex: 1,
  },
  pixKeyLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pixKeyValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.deepBlue,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  copyText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    color: Colors.light.deepBlue,
  },
  altButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.light.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  altIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBF4FB",
    alignItems: "center",
    justifyContent: "center",
  },
  altText: {
    flex: 1,
  },
  altTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  altSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  paypalDisclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  thankYouBox: {
    marginTop: 24,
    backgroundColor: Colors.light.deepBlue,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  crossSmall: {
    width: 20,
    height: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  crossV: {
    position: "absolute",
    width: 2,
    height: 20,
    backgroundColor: Colors.light.gold,
    borderRadius: 1,
  },
  crossH: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: Colors.light.gold,
    borderRadius: 1,
    top: 5,
  },
  thankYouText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 26,
    fontStyle: "italic",
  },
  thankYouRef: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    color: Colors.light.softGold,
    textAlign: "center",
  },
});

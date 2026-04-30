import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { MuralItem } from "@/services/muralService";

const CONTACT_EMAIL = "vivoemdeusvivo@gmail.com";

// ─────────────────────────────────────────────────────────────────
//  CONFIGURAÇÃO DO GITHUB
// ─────────────────────────────────────────────────────────────────
const GITHUB_USER   = "JS-Bonum-Eventum";
const GITHUB_REPO   = "Vivo-em-Deus-Mural";
const GITHUB_BRANCH = "main";
const GITHUB_FOLDER = "imagens";

function buildImageUrl(value: string): string | null {
  if (!value?.trim()) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const folder = GITHUB_FOLDER ? `${GITHUB_FOLDER}/` : "";
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${folder}${value.trim()}`;
}

// ── Imagem 16:9 com loading e fallback ───────────────────────────
function ItemImage({ value }: { value: string }) {
  const { width } = useWindowDimensions();
  const uri = buildImageUrl(value);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  if (!uri) return null;

  return (
    <View style={[imgStyles.wrapper, { height: Math.round((width - 40) * 9 / 16) }]}>
      {status === "error" ? (
        <View style={imgStyles.fallback}>
          <Ionicons name="image-outline" size={36} color="#ccc" />
          <Text style={imgStyles.fallbackText}>Imagem indisponível</Text>
        </View>
      ) : (
        <>
          <Image
            source={{ uri }}
            style={[imgStyles.image, status === "loading" && { opacity: 0 }]}
            resizeMode="contain"
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
          />
          {status === "loading" && (
            <View style={imgStyles.loadingOverlay}>
              <ActivityIndicator color="#1A237E" />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const imgStyles = StyleSheet.create({
  wrapper:        { width: "100%", borderRadius: 14, overflow: "hidden", marginBottom: 20, backgroundColor: "#1a1a2e" },
  image:          { width: "100%", height: "100%" },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  fallback:       { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  fallbackText:   { fontSize: 13, color: "#bbb" },
});

// ── Detecta tipo de contato ───────────────────────────────────────
async function abrirContato(valor: string) {
  const v = valor.trim();
  if (!v) return;
  if (v.startsWith("http")) { Linking.openURL(v); return; }
  if (v.includes("@") && !v.startsWith("@")) {
    // ✅ Bug 3: try/catch funciona com Mail, Gmail e qualquer app
    try {
      await Linking.openURL(`mailto:${v}`);
    } catch {
      Alert.alert("Sem app de e-mail", "Nenhum aplicativo de e-mail está configurado neste dispositivo.");
    }
    return;
  }
  if (/^\+?\d[\d\s()\-]{6,}$/.test(v)) { Linking.openURL(`tel:${v.replace(/\s/g, "")}`); return; }
  const username = v.replace("@", "");
  const appUrl = `instagram://user?username=${username}`;
  const appSupported = await Linking.canOpenURL(appUrl);
  Linking.openURL(appSupported ? appUrl : `https://instagram.com/${username}`);
}

function contatoIcone(valor: string): keyof typeof Ionicons.glyphMap {
  const v = valor.trim();
  if (v.startsWith("http"))                   return "globe-outline";
  if (v.includes("@") && !v.startsWith("@")) return "mail-outline";
  if (/^\+?\d[\d\s()\-]{6,}$/.test(v))       return "call-outline";
  return "logo-instagram";
}

// ── Linha de informação ───────────────────────────────────────────
function InfoRow({
  icon, text, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.infoRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color="#1A237E" />
      </View>
      <Text selectable={!!onPress} style={[styles.infoText, !!onPress && styles.infoLink]}>{text}</Text>
    </Wrapper>
  );
}

// ── Tela principal ────────────────────────────────────────────────
export default function MuralItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "ios" ? insets.bottom + 120 : 80; // ✅ espaço para tab bar flutuante

  const { categoria, itemJson } = useLocalSearchParams<{
    categoria: string;
    itemJson:  string;
  }>();

  let item: MuralItem | null = null;
  try { item = JSON.parse(itemJson ?? "null"); } catch {}

  // ✅ Evita crash "Go Back not handled" no iOS
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: "/mural/detalhe",
        params: { categoria },
      });
    }
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color="#1A237E" />
            <Text style={styles.backText}>{categoria}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Item não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#1A237E" />
          <Text style={styles.backText} numberOfLines={1}>{categoria}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Selo patrocinado no topo ── */}
        {item.patrocinado && (
          <View style={styles.seloPatrocinado}>
            <Ionicons name="star" size={12} color="#C2185B" />
            <Text style={styles.seloText}>CONTEÚDO PATROCINADO</Text>
          </View>
        )}

        {/* ── Imagem ── */}
        {!!item.imagem && <ItemImage value={item.imagem} />}

        {/* ── Título ── */}
        <Text style={styles.titulo}>{item.titulo}</Text>

        {/* ── Subtítulo ── */}
        {!!item.subtitulo && <Text style={styles.subtitulo}>{item.subtitulo}</Text>}

        <View style={styles.divider} />

        {/* ── Descrição ── */}
        {!!item.descricao && <Text style={styles.descricao}>{item.descricao}</Text>}

        {/* ── Bloco de informações ── */}
        <View style={styles.infoBlock}>
          {!!item.data   && <InfoRow icon="calendar-outline"          text={item.data} />}
          {!!item.local  && <InfoRow icon="location-outline"           text={item.local} />}
          {!!item.extra  && <InfoRow icon="information-circle-outline" text={item.extra} />}
          {!!item.contato && (
            <InfoRow
              icon={contatoIcone(item.contato)}
              text={item.contato}
              onPress={() => abrirContato(item!.contato)}
            />
          )}
        </View>

        {/* ── Botão "Saiba mais" (se linkExterno existir) ── */}
        {!!item.linkExterno && (
          <TouchableOpacity
            style={styles.saibaMaisBtn}
            onPress={() => Linking.openURL(item!.linkExterno!)}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={18} color="#fff" />
            <Text style={styles.saibaMaisText}>Saiba mais</Text>
          </TouchableOpacity>
        )}

        {/* ── Rodapé: quer divulgar? ── */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeText}>Quer divulgar aqui?</Text>
          <TouchableOpacity
            onPress={async () => {
              // ✅ Bug 3: try/catch funciona com Mail, Gmail e qualquer app
              try {
                await Linking.openURL(`mailto:${CONTACT_EMAIL}`);
              } catch {
                Alert.alert("Sem app de e-mail", "Nenhum aplicativo de e-mail está configurado neste dispositivo.");
              }
            }}
            onLongPress={async () => {
              // ✅ Bug 2: pressionar longo copia o email
              const { default: Clipboard } = await import("expo-clipboard");
              await Clipboard.setStringAsync(CONTACT_EMAIL);
              Alert.alert("Copiado!", "E-mail copiado para a área de transferência.");
            }}
            activeOpacity={0.7}
          >
            <Text selectable style={styles.rodapeLink}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: "#fff" },
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  backBtn:     { flexDirection: "row", alignItems: "center", gap: 2, maxWidth: "80%" },
  backText:    { fontSize: 15, fontWeight: "600", color: "#1A237E" },
  centered:    { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText:   { fontSize: 15, color: "#888" },

  content:     { padding: 20 },
  titulo:      { fontSize: 22, fontWeight: "700", color: "#1A237E", lineHeight: 30, marginBottom: 4 },
  subtitulo:   { fontSize: 14, color: "#888", marginBottom: 4 },
  divider:     { height: 1, backgroundColor: "#eee", marginVertical: 16 },
  descricao:   { fontSize: 16, color: "#333", lineHeight: 25, marginBottom: 20 },

  infoBlock:   { gap: 14, marginBottom: 24 },
  infoRow:     { flexDirection: "row", alignItems: "flex-start" },
  infoIconWrap:{ width: 28, marginTop: 2 },
  infoText:    { fontSize: 15, color: "#444", flex: 1, lineHeight: 22 },
  infoLink:    { color: "#1A237E", fontWeight: "600", textDecorationLine: "underline" },

  // ── Selo patrocinado ─────────────────────────────────────────
  seloPatrocinado: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: "rgba(194,24,91,0.08)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 14 },
  seloText:        { fontSize: 10, fontWeight: "700", color: "#C2185B", letterSpacing: 0.8 },

  // ── Botão Saiba mais ─────────────────────────────────────────
  saibaMaisBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1A237E", borderRadius: 12, paddingVertical: 14, marginBottom: 24 },
  saibaMaisText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // ── Rodapé ───────────────────────────────────────────────────
  rodape:     { marginTop: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#f0f0f0", alignItems: "center", gap: 4 },
  rodapeText: { fontSize: 13, color: "#aaa" },
  rodapeLink: { fontSize: 13, fontWeight: "600", color: "#1A237E", textDecorationLine: "underline" },
});

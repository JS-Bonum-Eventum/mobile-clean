import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { MuralItem } from "@/services/muralService";

// ─────────────────────────────────────────────────────────────────
//  CONFIGURAÇÃO DO GITHUB
//
//  1. Crie um repositório público no GitHub (ex: "mural-imagens")
//  2. Suba as imagens em formato 16:9 — tamanho ideal: 1280×720 px
//  3. Preencha as constantes abaixo
//
//  Na coluna "imagem" da planilha, coloque apenas o nome do arquivo:
//    evento-pascoa.jpg
//  Ou um caminho relativo dentro do repo:
//    eventos/evento-pascoa.jpg
//
//  URL final gerada automaticamente:
//    https://raw.githubusercontent.com/GITHUB_USER/GITHUB_REPO/GITHUB_BRANCH/GITHUB_FOLDER/evento-pascoa.jpg
// ─────────────────────────────────────────────────────────────────
const GITHUB_USER   = "JS-Bonum-Eventum";   // ← seu usuário GitHub
const GITHUB_REPO   = "Vivo-em-Deus-Mural";      // ← nome do repositório público
const GITHUB_BRANCH = "main";          // ← branch principal (main ou master)
const GITHUB_FOLDER = "imagens";       // ← pasta dentro do repo (deixe "" se for raiz)

function buildImageUrl(value: string): string | null {
  if (!value?.trim()) return null;
  // Se já for URL completa, usa direto
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  // Monta URL raw do GitHub
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

// ── Detecta tipo de contato e abre o app correto ─────────────────
function abrirContato(valor: string) {
  const v = valor.trim();
  if (!v) return;
  if (v.startsWith("http"))                      return Linking.openURL(v);
  if (v.includes("@") && !v.startsWith("@"))     return Linking.openURL(`mailto:${v}`);
  if (/^\+?\d[\d\s()\-]{6,}$/.test(v))          return Linking.openURL(`tel:${v.replace(/\s/g, "")}`);
  return Linking.openURL(`https://instagram.com/${v.replace("@", "")}`);
}

function contatoIcone(valor: string): keyof typeof Ionicons.glyphMap {
  const v = valor.trim();
  if (v.startsWith("http"))                    return "globe-outline";
  if (v.includes("@") && !v.startsWith("@"))  return "mail-outline";
  if (/^\+?\d[\d\s()\-]{6,}$/.test(v))        return "call-outline";
  return "logo-instagram";
}

// ── Linha de informação ───────────────────────────────────────────
function InfoRow({
  icon,
  text,
  onPress,
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
      <Text style={[styles.infoText, !!onPress && styles.infoLink]}>
        {text}
      </Text>
    </Wrapper>
  );
}

// ── Tela principal ────────────────────────────────────────────────
export default function MuralItemScreen() {
  const router = useRouter();
  const { categoria, itemJson } = useLocalSearchParams<{
    categoria: string;
    itemJson:  string;
  }>();

  let item: MuralItem | null = null;
  try { item = JSON.parse(itemJson ?? "null"); } catch {}

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#1A237E" />
          <Text style={styles.backText} numberOfLines={1}>
            {categoria}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Imagem 16:9 ── */}
        {!!item.imagem && <ItemImage value={item.imagem} />}

        {/* ── Título ── */}
        <Text style={styles.titulo}>{item.titulo}</Text>

        {/* ── Subtítulo ── */}
        {!!item.subtitulo && (
          <Text style={styles.subtitulo}>{item.subtitulo}</Text>
        )}

        <View style={styles.divider} />

        {/* ── Descrição ── */}
        {!!item.descricao && (
          <Text style={styles.descricao}>{item.descricao}</Text>
        )}

        {/* ── Bloco de informações ── */}
        <View style={styles.infoBlock}>
          {!!item.data && (
            <InfoRow icon="calendar-outline" text={item.data} />
          )}
          {!!item.local && (
            <InfoRow icon="location-outline" text={item.local} />
          )}
          {!!item.extra && (
            <InfoRow icon="information-circle-outline" text={item.extra} />
          )}
          {!!item.contato && (
            <InfoRow
              icon={contatoIcone(item.contato)}
              text={item.contato}
              onPress={() => abrirContato(item!.contato)}
            />
          )}
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

  content:     { padding: 20, paddingBottom: 48 },
  titulo:      { fontSize: 22, fontWeight: "700", color: "#1A237E", lineHeight: 30, marginBottom: 4 },
  subtitulo:   { fontSize: 14, color: "#888", marginBottom: 4 },
  divider:     { height: 1, backgroundColor: "#eee", marginVertical: 16 },
  descricao:   { fontSize: 16, color: "#333", lineHeight: 25, marginBottom: 20 },

  infoBlock:   { gap: 14 },
  infoRow:     { flexDirection: "row", alignItems: "flex-start" },
  infoIconWrap:{ width: 28, marginTop: 2 },
  infoText:    { fontSize: 15, color: "#444", flex: 1, lineHeight: 22 },
  infoLink:    { color: "#1A237E", fontWeight: "600", textDecorationLine: "underline" },
});

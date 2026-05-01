import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import {
  fetchMuralItems,
  type MuralItem,
  type MuralCategoria,
} from "@/services/muralService";

const CONTACT_EMAIL = "vivoemdeusvivo@gmail.com";

// ✅ Abre email com try/catch — funciona com Mail, Gmail e qualquer app
// Bug 3: canOpenURL retorna true mesmo sem Mail.app no iOS
//        try/catch captura o erro real se nenhum app abrir
async function abrirEmail() {
  const url = `mailto:${CONTACT_EMAIL}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Sem app de e-mail",
      "Nenhum aplicativo de e-mail está configurado neste dispositivo."
    );
  }
}

// ── Quantos itens entre cada card patrocinado intercalado ─────────
const SPONSORED_INTERVAL = 5;

// ── Tipo da lista (item real ou card intercalado) ─────────────────
type ListRow =
  | { kind: "item"; data: MuralItem; index: number }
  | { kind: "sponsored_card" };

// ── Ordenação: patrocinado > prioridade > restante ────────────────
function ordenarItens(items: MuralItem[]): MuralItem[] {
  return [...items].sort((a, b) => {
    // Patrocinados primeiro
    if (a.patrocinado && !b.patrocinado) return -1;
    if (!a.patrocinado && b.patrocinado) return 1;
    // Depois por prioridade decrescente
    return (b.prioridade ?? 0) - (a.prioridade ?? 0);
  });
}

// ── Intercala card "Quer divulgar?" a cada SPONSORED_INTERVAL itens
function buildRows(items: MuralItem[]): ListRow[] {
  const rows: ListRow[] = [];
  items.forEach((item, i) => {
    rows.push({ kind: "item", data: item, index: i });
    // Insere card a cada N itens (não no último)
    if ((i + 1) % SPONSORED_INTERVAL === 0 && i < items.length - 1) {
      rows.push({ kind: "sponsored_card" });
    }
  });
  return rows;
}

// ── Tela vazia ────────────────────────────────────────────────────
function EmptyState({ categoria }: { categoria: string }) {
  return (
    <View style={styles.centered}>
      <Ionicons name="construct-outline" size={52} color="#C2185B" />
      <Text style={styles.emptyTitle}>Em Breve!</Text>
      <Text style={styles.emptyText}>
        Ainda não há itens em{" "}
        <Text style={styles.bold}>{categoria}</Text>.
      </Text>
      <Text style={styles.emptyText}>Quer divulgar algo aqui?</Text>
      <TouchableOpacity
        onPress={() => abrirEmail()}
        onLongPress={() => {
          Clipboard.setStringAsync(CONTACT_EMAIL).then(() => {
            Alert.alert("Copiado!", "E-mail copiado para a área de transferência.");
          });
        }}
        activeOpacity={0.7}
      >
        {/* ✅ Bug 2: selectable permite copiar manualmente */}
        <Text selectable style={styles.emailLink}>{CONTACT_EMAIL}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Badge "PATROCINADO" ───────────────────────────────────────────
function BadgePatrocinado() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>PATROCINADO</Text>
    </View>
  );
}

// ── Card intercalado "Quer divulgar?" ────────────────────────────
function SponsoredCard() {
  return (
    <TouchableOpacity
      style={styles.sponsoredCard}
      onPress={() => abrirEmail()}
      activeOpacity={0.8}
    >
      <Ionicons name="megaphone-outline" size={20} color="#C2185B" />
      <View style={styles.sponsoredCardText}>
        <Text style={styles.sponsoredCardTitle}>Espaço para apoiadores</Text>
        <Text style={styles.sponsoredCardSub}>Quer divulgar aqui? Entre em contato</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C2185B" />
    </TouchableOpacity>
  );
}

// ── Linha da lista ────────────────────────────────────────────────
function ItemRow({
  item,
  onPress,
}: {
  item: MuralItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, item.destaque && styles.rowDestaque]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowText}>
        <View style={styles.rowTitleRow}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.titulo}
          </Text>
          {item.patrocinado && <BadgePatrocinado />}
        </View>
        {!!item.subtitulo && (
          <Text style={styles.rowSub} numberOfLines={1}>
            {item.subtitulo}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </TouchableOpacity>
  );
}

// ── Tela principal ────────────────────────────────────────────────
export default function DetalheMural() {
  const router        = useRouter();
  const insets        = useSafeAreaInsets();
  const bottomPad     = Platform.OS === "ios" ? insets.bottom + 120 : 40;
  const { categoria } = useLocalSearchParams<{ categoria: string }>();

  const [items,      setItems]      = useState<MuralItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(false);

  // ── Load memoizado ────────────────────────────────────────────
  const load = useCallback(async (force = false) => {
    try {
      setError(false);
      const data = await fetchMuralItems(categoria as MuralCategoria, force);
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoria]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  // ── Ordenação e montagem das rows (memoizado) ─────────────────
  const rows = useMemo<ListRow[]>(() => {
    const ordenados = ordenarItens(items);
    return buildRows(ordenados);
  }, [items]);

  // ✅ Fix "Go Back" perdido após troca de tab no iOS:
  //    canGoBack() verifica se o stack interno ainda tem histórico.
  //    Se não tiver (stack zerado pela troca de tab), navega
  //    explicitamente para o índice do Mural em vez de travar.
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      // ✅ Stack zerado (More screen iOS) → volta para index do mural
      router.replace({ pathname: "/(tabs)/mural" });
    }
  }

  function abrirItem(item: MuralItem, index: number) {
    router.push({
      pathname: "/mural/item",
      params: {
        categoria,
        itemJson: JSON.stringify(item),
        index: String(index),
      },
    });
  }

  // ── Render de cada row ────────────────────────────────────────
  const renderRow = useCallback(({ item: row }: { item: ListRow }) => {
    if (row.kind === "sponsored_card") {
      return <SponsoredCard />;
    }
    return (
      <ItemRow
        item={row.data}
        onPress={() => abrirItem(row.data, row.index)}
      />
    );
  }, [categoria]);

  const keyExtractor = useCallback((_: ListRow, i: number) => String(i), []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#1A237E" />
          <Text style={styles.backText}>Mural</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoria}
        </Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Estados */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A237E" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color="#bbb" />
          <Text style={styles.errorText}>
            Não foi possível carregar.{"\n"}Verifique sua conexão.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => { setLoading(true); load(true); }}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <EmptyState categoria={categoria ?? ""} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderRow}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          // ── Performance ──────────────────────────────────────
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1A237E"]}
              tintColor="#1A237E"
            />
          }
          ListHeaderComponent={
            <Text style={styles.countLabel}>
              {items.length} {items.length === 1 ? "item" : "itens"}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: "#fff" },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  backBtn:     { flexDirection: "row", alignItems: "center", gap: 2, width: 64 },
  backText:    { fontSize: 15, fontWeight: "600", color: "#1A237E" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#1A237E", textAlign: "center", flex: 1 },

  centered:    { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  loadingText: { fontSize: 14, color: "#888" },
  errorText:   { fontSize: 15, color: "#888", textAlign: "center", lineHeight: 22 },
  retryBtn:    { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: "#1A237E", borderRadius: 10 },
  retryText:   { color: "#fff", fontWeight: "700", fontSize: 14 },

  emptyTitle:  { fontSize: 20, fontWeight: "700", color: "#1A237E" },
  emptyText:   { fontSize: 15, color: "#555", textAlign: "center", lineHeight: 22 },
  bold:        { fontWeight: "700", color: "#1A237E" },
  emailLink:   { fontSize: 15, fontWeight: "700", color: "#007AFF", textDecorationLine: "underline", marginTop: 4 },

  listContent: { paddingBottom: 40 },
  countLabel:  { fontSize: 12, color: "#aaa", textAlign: "right", paddingHorizontal: 16, paddingVertical: 8 },

  // ── Item row ──────────────────────────────────────────────────
  row:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff" },
  rowDestaque:  { backgroundColor: "#FFF8F9", borderLeftWidth: 3, borderLeftColor: "#C2185B" },
  rowText:      { flex: 1 },
  rowTitleRow:  { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  rowTitle:     { fontSize: 16, color: "#1a1a1a", fontWeight: "600", flexShrink: 1 },
  rowSub:       { fontSize: 13, color: "#888", marginTop: 2 },
  separator:    { height: 1, backgroundColor: "#f0f0f0", marginLeft: 16 },

  // ── Badge patrocinado ─────────────────────────────────────────
  badge:        { backgroundColor: "rgba(194,24,91,0.10)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:    { fontSize: 9, fontWeight: "700", color: "#C2185B", letterSpacing: 0.5 },

  // ── Card intercalado ─────────────────────────────────────────
  sponsoredCard:     { flexDirection: "row", alignItems: "center", gap: 12, margin: 12, padding: 14, backgroundColor: "#FFF0F4", borderRadius: 12, borderWidth: 1, borderColor: "rgba(194,24,91,0.15)" },
  sponsoredCardText: { flex: 1 },
  sponsoredCardTitle:{ fontSize: 13, fontWeight: "700", color: "#C2185B" },
  sponsoredCardSub:  { fontSize: 11, color: "#888", marginTop: 2 },
});

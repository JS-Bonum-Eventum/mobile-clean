import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchMuralItems,
  type MuralItem,
  type MuralCategoria,
} from "@/services/muralService";

const CONTACT_EMAIL = "vivoemdeusvivo@gmail.com";

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
        onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        activeOpacity={0.7}
      >
        <Text style={styles.emailLink}>{CONTACT_EMAIL}</Text>
      </TouchableOpacity>
    </View>
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
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
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
  const router             = useRouter();
  const { categoria }      = useLocalSearchParams<{ categoria: string }>();

  const [items,      setItems]      = useState<MuralItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(false);

  async function load(force = false) {
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
  }

  useEffect(() => { load(); }, [categoria]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [categoria]);

  function abrirItem(item: MuralItem, index: number) {
    // Serializa o item como JSON e passa por parâmetro
    router.push({
      pathname: "/mural/item",
      params: {
        categoria,
        itemJson: JSON.stringify(item),
        index: String(index),
      },
    });
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
          data={items}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <ItemRow item={item} onPress={() => abrirItem(item, index)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

  row:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff" },
  rowText:     { flex: 1 },
  rowTitle:    { fontSize: 16, color: "#1a1a1a", fontWeight: "600" },
  rowSub:      { fontSize: 13, color: "#888", marginTop: 2 },
  separator:   { height: 1, backgroundColor: "#f0f0f0", marginLeft: 16 },
});

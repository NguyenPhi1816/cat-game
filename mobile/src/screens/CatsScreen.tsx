import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiClient } from "../api/client";
import type { CatListScreenProps } from "../navigation/types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { RefreshControl } from "../components/NativeWrappers";

interface Cat {
  id: string;
  name: string;
  level: number;
  personality_type: string;
  energy: number;
  happiness: number;
}

function StatBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.barBg}>
      <View
        style={[
          styles.barFill,
          {
            width: `${Math.max(0, Math.min(1, value)) * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export default function CatsScreen({ navigation }: CatListScreenProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCats = useCallback(async () => {
    setError(null);
    try {
      const res = await apiClient.get("/cats");
      setCats(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load cats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCats();
  }, [fetchCats]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCats} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={cats}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No cats yet. Add your first one!</Text>
        }
        ListFooterComponent={
          cats.length < 3 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate("CreateCat")}
            >
              <Text style={styles.addBtnText}>+ Add Cat</Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("CatDetail", {
                catId: item.id,
                catName: item.name,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.catName}>🐱 {item.name}</Text>
              <Text style={styles.level}>Lv.{item.level}</Text>
            </View>
            <Text style={styles.personality}>{item.personality_type}</Text>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>⚡</Text>
              <StatBar value={item.energy} color="#4CAF50" />
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>😊</Text>
              <StatBar value={item.happiness} color="#FF9800" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  empty: { textAlign: "center", color: "#999", padding: 32 },
  card: {
    backgroundColor: "#fff",
    margin: 8,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  catName: { fontSize: 17, fontWeight: "bold" },
  level: { fontSize: 14, color: "#6c63ff", fontWeight: "600" },
  personality: { color: "#666", fontSize: 13, marginBottom: 10 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  barLabel: { width: 22, fontSize: 13 },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },
  addBtn: {
    margin: 16,
    backgroundColor: "#6c63ff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

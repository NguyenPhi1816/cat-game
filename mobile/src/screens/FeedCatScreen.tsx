import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import ItemCard from '../components/ItemCard';
import type { FeedCatScreenProps } from '../navigation/types';

interface InventoryEntry {
  item: { id: string; name: string; type: string };
  quantity: number;
}

export default function FeedCatScreen({ route, navigation }: FeedCatScreenProps) {
  const { catId } = route.params;
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeding, setFeeding] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await apiClient.get('/economy/inventory');
      const food = (Array.isArray(res.data) ? res.data : []).filter(
        (e: InventoryEntry) => e.item?.type === 'ingredient' && e.quantity > 0,
      );
      setInventory(food);
    } catch {
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleFeed = useCallback(async (itemId: string, itemName: string) => {
    setFeeding(itemId);
    try {
      await apiClient.post(`/cats/${catId}/feed`, { item_id: itemId });
      Alert.alert('Fed!', `${itemName} was given to your cat.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Failed', 'Could not feed cat. Item may be out of stock.');
    } finally {
      setFeeding(null);
    }
  }, [catId, navigation]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <FlatList
      data={inventory}
      keyExtractor={(i) => i.item?.id ?? Math.random().toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No food in inventory. Buy some from the Shop!</Text>}
      renderItem={({ item }) => (
        <ItemCard
          name={item.item?.name}
          type={item.item?.type}
          quantity={item.quantity}
          onBuy={() => handleFeed(item.item.id, item.item.name)}
          buying={feeding === item.item.id}
          price={undefined}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#999', padding: 32, lineHeight: 22 },
});

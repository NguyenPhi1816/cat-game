import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

type Tab = 'shop' | 'inventory';

interface Item {
  id: string;
  name: string;
  type: string;
  price: number;
}

interface InventoryEntry {
  item: Item;
  quantity: number;
}

export default function ShopScreen() {
  const [tab, setTab] = useState<Tab>('shop');
  const [items, setItems] = useState<Item[]>([]);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [walletMoney, setWalletMoney] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [shopRes, invRes, walletRes] = await Promise.all([
        apiClient.get('/economy/shop'),
        apiClient.get('/economy/inventory'),
        apiClient.get('/economy/wallet'),
      ]);
      setItems(Array.isArray(shopRes.data) ? shopRes.data : []);
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);
      setWalletMoney(walletRes.data?.money ?? 0);
    } catch {
      setError('Failed to load shop');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const handleBuy = useCallback(async (item: Item) => {
    setBuying(item.id);
    try {
      await apiClient.post('/economy/buy', { item_id: item.id, quantity: 1 });
      fetchData();
    } catch {
      Alert.alert('Failed', 'Not enough coins');
    } finally {
      setBuying(null);
    }
  }, [fetchData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <View style={styles.container}>
      <View style={styles.walletBar}>
        <Text style={styles.walletText}>💰 {walletMoney} coins</Text>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'shop' && styles.tabActive]} onPress={() => setTab('shop')}>
          <Text style={[styles.tabText, tab === 'shop' && styles.tabTextActive]}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'inventory' && styles.tabActive]} onPress={() => setTab('inventory')}>
          <Text style={[styles.tabText, tab === 'inventory' && styles.tabTextActive]}>Inventory</Text>
        </TouchableOpacity>
      </View>

      {tab === 'shop' ? (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No items available</Text>}
          renderItem={({ item }) => (
            <ItemCard
              name={item.name}
              type={item.type}
              price={item.price}
              onBuy={() => handleBuy(item)}
              buying={buying === item.id}
            />
          )}
        />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(i) => i.item?.id ?? Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>Inventory is empty</Text>}
          renderItem={({ item }) => (
            <ItemCard name={item.item?.name ?? '?'} type={item.item?.type ?? ''} quantity={item.quantity} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  walletBar: { backgroundColor: '#6c63ff', padding: 12, alignItems: 'center' },
  walletText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6c63ff' },
  tabText: { color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#6c63ff' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#999', padding: 32 },
});

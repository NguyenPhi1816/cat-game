import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface Room {
  id: string;
  name: string;
  level: number;
}

interface House {
  id: string;
  level: number;
}

const ROOM_EMOJIS: Record<string, string> = {
  kitchen: '🍳',
  living_room: '🛋️',
  bedroom: '🛏️',
  bathroom: '🚿',
};

const ROOM_BONUSES: Record<string, string> = {
  kitchen: 'Better cooking results',
  living_room: 'Cat happiness boost',
  bedroom: 'Faster energy recovery',
  bathroom: 'Reduced stress',
};

export default function HouseScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const fetchHouse = useCallback(async () => {
    setError(null);
    try {
      const res = await apiClient.get('/player/house');
      setRooms(Array.isArray(res.data.rooms) ? res.data.rooms : []);
    } catch {
      setError('Failed to load house');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHouse(); }, [fetchHouse]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchHouse(); }, [fetchHouse]);

  const handleUpgrade = useCallback((room: Room) => {
    const cost = room.level * 50;
    Alert.alert(
      'Upgrade Room',
      `Upgrade ${room.name} to level ${room.level + 1} for ${cost} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            setUpgrading(room.id);
            try {
              await apiClient.post(`/player/house/rooms/${room.id}/upgrade`);
              fetchHouse();
            } catch {
              Alert.alert('Failed', 'Not enough coins or upgrade failed');
            } finally {
              setUpgrading(null);
            }
          },
        },
      ],
    );
  }, [fetchHouse]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHouse} />;

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.emoji}>{ROOM_EMOJIS[item.name] ?? '🏠'}</Text>
            <View>
              <Text style={styles.roomName}>{item.name.replace(/_/g, ' ')}</Text>
              <Text style={styles.bonus}>{ROOM_BONUSES[item.name] ?? 'Bonus'}</Text>
              <Text style={styles.level}>Level {item.level}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.upgradeBtn, upgrading === item.id && styles.upgradeBtnDisabled]}
            onPress={() => handleUpgrade(item)}
            disabled={upgrading === item.id}
          >
            {upgrading === item.id
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.upgradeBtnText}>⬆️ {item.level * 50}g</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 32 },
  roomName: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  bonus: { color: '#666', fontSize: 12, marginTop: 2 },
  level: { color: '#6c63ff', fontSize: 13, marginTop: 4, fontWeight: '600' },
  upgradeBtn: { backgroundColor: '#6c63ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  upgradeBtnDisabled: { backgroundColor: '#aaa' },
  upgradeBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

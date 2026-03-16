import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import type { CatDetailScreenProps } from '../navigation/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface CatDetail {
  id: string;
  name: string;
  level: number;
  experience: number;
  care_level: number;
  personality_type: string;
  energy: number;
  happiness: number;
  status?: { hunger: number; happiness: number; stress: number };
  memories?: { id: string; memory_type: string; description: string; created_at: string }[];
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{(value * 100).toFixed(0)}%</Text>
    </View>
  );
}

export default function CatDetailScreen({ route, navigation }: CatDetailScreenProps) {
  const { catId } = route.params;
  const [cat, setCat] = useState<CatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCat = useCallback(async () => {
    setError(null);
    try {
      const res = await apiClient.get(`/cats/${catId}`);
      setCat(res.data);
    } catch {
      setError('Failed to load cat details');
    } finally {
      setLoading(false);
    }
  }, [catId]);

  useEffect(() => { fetchCat(); }, [fetchCat]);

  if (loading || !cat) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCat} />;

  const xpThreshold = cat.level * 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>🐱 {cat.name}</Text>
        <Text style={styles.meta}>Lv.{cat.level} · {cat.personality_type} · Care Lv.{cat.care_level}</Text>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, (cat.experience / xpThreshold) * 100)}%`, backgroundColor: '#9c27b0' }]} />
          </View>
          <Text style={styles.xpValue}>{cat.experience}/{xpThreshold}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.card}>
        <StatBar label="⚡ Energy" value={cat.energy} color="#4CAF50" />
        <StatBar label="😊 Happy" value={cat.happiness} color="#FF9800" />
        <StatBar label="🍽️ Hunger" value={cat.status?.hunger ?? 0} color="#f44336" />
        <StatBar label="😰 Stress" value={cat.status?.stress ?? 0} color="#9e9e9e" />
      </View>

      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('FeedCat', { catId: cat.id })}>
          <Text style={styles.actionIcon}>🍖</Text>
          <Text style={styles.actionLabel}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Cook', { catId: cat.id })}>
          <Text style={styles.actionIcon}>🍳</Text>
          <Text style={styles.actionLabel}>Cook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Jobs')}>
          <Text style={styles.actionIcon}>💼</Text>
          <Text style={styles.actionLabel}>Jobs</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Memories</Text>
      {(Array.isArray(cat.memories) ? cat.memories : []).length === 0 && (
        <Text style={styles.empty}>No memories yet.</Text>
      )}
      {(Array.isArray(cat.memories) ? cat.memories : []).map((m) => (
        <View key={m.id} style={styles.memoryCard}>
          <Text style={styles.memoryType}>{m.memory_type.replace(/_/g, ' ')}</Text>
          <Text style={styles.memoryDesc}>{m.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { backgroundColor: '#6c63ff', padding: 20 },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  meta: { color: '#ddd', fontSize: 14, marginTop: 4 },
  xpRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  xpLabel: { color: '#fff', width: 28, fontSize: 12 },
  xpValue: { color: '#fff', width: 56, fontSize: 12, textAlign: 'right' },
  sectionTitle: { fontSize: 16, fontWeight: '700', margin: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 14, elevation: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 70, fontSize: 13 },
  barBg: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barValue: { width: 36, textAlign: 'right', fontSize: 12, color: '#666' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 8 },
  actionBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', width: '30%', elevation: 2 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 12, marginTop: 4, color: '#333' },
  empty: { textAlign: 'center', color: '#999', padding: 16 },
  memoryCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 10, elevation: 1 },
  memoryType: { fontWeight: '600', color: '#6c63ff', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  memoryDesc: { color: '#333', fontSize: 14 },
});

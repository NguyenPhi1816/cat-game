import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useAuth } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface DailyReport {
  has_report: boolean;
  hours_away?: number;
  salary_earned?: number;
  capped?: boolean;
  cat_reports?: { cat_name: string; actions_performed: string[]; xp_gained: number; leveled_up: boolean }[];
  narrative?: string;
}

interface PlayerProfile {
  player_name: string;
  level: number;
}

interface Wallet {
  money: number;
}

interface Cat {
  id: string;
  name: string;
  level: number;
  personality_type: string;
  energy: number;
  happiness: number;
}

export default function HomeScreen() {
  const { logout } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [reportRes, profileRes, walletRes, catsRes] = await Promise.all([
        apiClient.get('/player/daily-report'),
        apiClient.get('/player/profile'),
        apiClient.get('/economy/wallet'),
        apiClient.get('/cats'),
      ]);
      setReport(reportRes.data);
      setProfile(profileRes.data);
      setWallet(walletRes.data);
      setCats(Array.isArray(catsRes.data) ? catsRes.data : []);
      if (reportRes.data?.has_report) setShowReport(true);
    } catch {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAll} />;

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.playerName}>👤 {profile?.player_name}</Text>
            <Text style={styles.level}>Level {profile?.level}</Text>
          </View>
          <View style={styles.walletRow}>
            <Text style={styles.walletText}>💰 {wallet?.money ?? 0}</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>🐾 Your Cats</Text>
        {cats.length === 0 && <Text style={styles.empty}>No cats yet. Go to the Cats tab to add one!</Text>}
        {cats.map((cat) => (
          <View key={cat.id} style={styles.catCard}>
            <Text style={styles.catName}>{cat.name}</Text>
            <Text style={styles.catMeta}>Lv.{cat.level} · {cat.personality_type}</Text>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>⚡</Text>
              <View style={styles.barBg}><View style={[styles.barFill, { width: `${cat.energy * 100}%`, backgroundColor: '#4CAF50' }]} /></View>
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>😊</Text>
              <View style={styles.barBg}><View style={[styles.barFill, { width: `${cat.happiness * 100}%`, backgroundColor: '#FF9800' }]} /></View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showReport} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📋 Daily Report</Text>
            <Text style={styles.modalText}>You were away for {report?.hours_away?.toFixed(1)} hours{report?.capped ? ' (capped at 8h)' : ''}</Text>
            <Text style={styles.modalText}>💰 Salary earned: {report?.salary_earned} coins</Text>
            {(Array.isArray(report?.cat_reports) ? report.cat_reports : []).map((cr, i) => (
              <View key={i} style={styles.catReport}>
                <Text style={styles.catReportName}>{cr.cat_name} +{cr.xp_gained} XP{cr.leveled_up ? ' 🎉 Level Up!' : ''}</Text>
                {(Array.isArray(cr.actions_performed) ? cr.actions_performed : []).map((a, j) => (
                  <Text key={j} style={styles.catAction}>• {a}</Text>
                ))}
              </View>
            ))}
            {report?.narrative && <Text style={styles.narrative}>{report.narrative}</Text>}
            <TouchableOpacity style={styles.dismissBtn} onPress={() => setShowReport(false)}>
              <Text style={styles.dismissText}>Let's Go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#6c63ff' },
  playerName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  level: { color: '#ddd', fontSize: 13 },
  walletRow: { alignItems: 'flex-end' },
  walletText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { marginTop: 4 },
  logoutText: { color: '#ffcdd2', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 8 },
  empty: { textAlign: 'center', color: '#999', padding: 24 },
  catCard: { backgroundColor: '#fff', margin: 8, marginHorizontal: 16, padding: 12, borderRadius: 12, elevation: 2 },
  catName: { fontSize: 16, fontWeight: 'bold' },
  catMeta: { color: '#666', fontSize: 13, marginBottom: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  barLabel: { width: 20, fontSize: 12 },
  barBg: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 15, marginBottom: 8 },
  catReport: { backgroundColor: '#f0f0ff', padding: 10, borderRadius: 8, marginBottom: 8 },
  catReportName: { fontWeight: '600', marginBottom: 4 },
  catAction: { color: '#555', fontSize: 13 },
  narrative: { fontStyle: 'italic', color: '#444', marginTop: 8, marginBottom: 12, lineHeight: 20 },
  dismissBtn: { backgroundColor: '#6c63ff', borderRadius: 8, padding: 14, alignItems: 'center' },
  dismissText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

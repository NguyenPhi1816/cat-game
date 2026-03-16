import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import type { JobsScreenProps } from '../navigation/types';

interface Job {
  id: string;
  name: string;
  reward_money: number;
  duration: number;
}

interface ActiveJob {
  id: string;
  cat_id: string;
  job_id: string;
  end_time: string;
  remaining_seconds: number;
  job?: Job;
}

interface Cat {
  id: string;
  name: string;
  energy: number;
}

function useCountdown(endTime: string) {
  const [remaining, setRemaining] = useState(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return { remaining, label: `${m}m ${s.toString().padStart(2, '0')}s` };
}

function ActiveJobRow({ activeJob, onCollect }: { activeJob: ActiveJob; onCollect: (id: string) => void }) {
  const { remaining, label } = useCountdown(activeJob.end_time);
  const done = remaining === 0;

  return (
    <View style={styles.activeCard}>
      <View>
        <Text style={styles.jobName}>{activeJob.job?.name ?? 'Job'}</Text>
        <Text style={styles.jobMeta}>💰 {activeJob.job?.reward_money} coins</Text>
        <Text style={[styles.timer, done && styles.timerDone]}>
          {done ? '✅ Ready to collect!' : `⏱ ${label}`}
        </Text>
      </View>
      {done && (
        <TouchableOpacity style={styles.collectBtn} onPress={() => onCollect(activeJob.id)}>
          <Text style={styles.collectBtnText}>Collect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function JobsScreen({ navigation }: JobsScreenProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigningJob, setAssigningJob] = useState<Job | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, activeRes, catsRes] = await Promise.all([
        apiClient.get('/quests/jobs'),
        apiClient.get('/quests/active'),
        apiClient.get('/cats'),
      ]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setActiveJobs(Array.isArray(activeRes.data) ? activeRes.data : []);
      setCats(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch {
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const handleAssign = useCallback(async (catId: string) => {
    if (!assigningJob) return;
    setAssigning(true);
    try {
      await apiClient.post('/quests/assign', { cat_id: catId, job_id: assigningJob.id });
      setAssigningJob(null);
      fetchData();
    } catch {
      Alert.alert('Failed', 'Cat may already be on a job or have low energy.');
    } finally {
      setAssigning(false);
    }
  }, [assigningJob, fetchData]);

  const handleCollect = useCallback(async (catJobId: string) => {
    try {
      const res = await apiClient.post(`/quests/complete/${catJobId}`);
      Alert.alert('Collected! 🎉', `+${res.data.reward_money} coins\n+${res.data.xp_gained} XP${res.data.cat_level ? `\nCat Lv.${res.data.cat_level}` : ''}`);
      fetchData();
    } catch {
      Alert.alert('Error', 'Failed to collect reward');
    }
  }, [fetchData]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeJobs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>⏳ Active Jobs</Text>
            {activeJobs.map((aj) => (
              <ActiveJobRow key={aj.id} activeJob={aj} onCollect={handleCollect} />
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>📋 Available Jobs</Text>
        {jobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View>
              <Text style={styles.jobName}>{job.name}</Text>
              <Text style={styles.jobMeta}>💰 {job.reward_money} coins · ⏱ {job.duration}min</Text>
            </View>
            <TouchableOpacity style={styles.sendBtn} onPress={() => setAssigningJob(job)}>
              <Text style={styles.sendBtnText}>Send Cat</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={assigningJob !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a Cat</Text>
            <Text style={styles.modalSub}>Job: {assigningJob?.name}</Text>
            {cats.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catOption, cat.energy < 0.3 && styles.catOptionDisabled]}
                onPress={() => handleAssign(cat.id)}
                disabled={cat.energy < 0.3 || assigning}
              >
                <Text style={styles.catOptionName}>🐱 {cat.name}</Text>
                <Text style={styles.catOptionEnergy}>⚡ {(cat.energy * 100).toFixed(0)}%{cat.energy < 0.3 ? ' (too tired)' : ''}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAssigningJob(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', margin: 16, marginBottom: 8 },
  jobCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  jobName: { fontSize: 15, fontWeight: '600' },
  jobMeta: { color: '#666', fontSize: 13, marginTop: 4 },
  sendBtn: { backgroundColor: '#6c63ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtnText: { color: '#fff', fontWeight: '600' },
  activeCard: { backgroundColor: '#e8f5e9', marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: { color: '#666', fontSize: 13, marginTop: 4 },
  timerDone: { color: '#4CAF50', fontWeight: '600' },
  collectBtn: { backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  collectBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  modalSub: { color: '#666', marginBottom: 16 },
  catOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 10, backgroundColor: '#f0f0ff', marginBottom: 10 },
  catOptionDisabled: { backgroundColor: '#f5f5f5', opacity: 0.6 },
  catOptionName: { fontWeight: '600', fontSize: 15 },
  catOptionEnergy: { color: '#666', fontSize: 13 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#f44336', fontWeight: '600' },
});

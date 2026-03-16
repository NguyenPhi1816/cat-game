import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import type { CreateCatScreenProps } from '../navigation/types';

const PERSONALITIES = ['playful', 'chef', 'lazy', 'clean_freak', 'random'] as const;
type Personality = (typeof PERSONALITIES)[number];

export default function CreateCatScreen({ navigation }: CreateCatScreenProps) {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState<Personality>('random');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your cat');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/cats', {
        name: name.trim(),
        personality_type: personality === 'random' ? undefined : personality,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create cat. You may already have 3 cats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cat Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Luna"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Personality</Text>
      <View style={styles.pills}>
        {PERSONALITIES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.pill, personality === p && styles.pillActive]}
            onPress={() => setPersonality(p)}
          >
            <Text style={[styles.pillText, personality === p && styles.pillTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Cat 🐱</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  pill: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  pillActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  pillText: { color: '#555', fontSize: 13 },
  pillTextActive: { color: '#fff' },
  button: { backgroundColor: '#6c63ff', borderRadius: 10, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

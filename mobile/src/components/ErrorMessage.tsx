import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 40, marginBottom: 12 },
  message: { color: '#555', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#6c63ff', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

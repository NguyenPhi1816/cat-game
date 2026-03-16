import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingSpinnerProps {
  color?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ color = '#6c63ff', size = 'large' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

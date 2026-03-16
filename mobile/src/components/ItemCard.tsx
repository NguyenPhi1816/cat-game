import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  name: string;
  type: string;
  price?: number;
  quantity?: number;
  onBuy?: () => void;
  buying?: boolean;
}

export default function ItemCard({ name, type, price, quantity, onBuy, buying }: Props) {
  const emoji = type === 'ingredient' ? '🥩' : type === 'furniture' ? '🛋️' : '📦';

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.type}>{type}</Text>
        {quantity !== undefined && <Text style={styles.quantity}>x{quantity}</Text>}
      </View>
      {price !== undefined && onBuy && (
        <TouchableOpacity style={styles.buyBtn} onPress={onBuy} disabled={buying}>
          <Text style={styles.buyText}>{buying ? '...' : `💰 ${price}`}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  emoji: { fontSize: 28, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  type: { color: '#888', fontSize: 12, textTransform: 'capitalize' },
  quantity: { color: '#6c63ff', fontWeight: '700', fontSize: 14, marginTop: 2 },
  buyBtn: { backgroundColor: '#6c63ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  buyText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

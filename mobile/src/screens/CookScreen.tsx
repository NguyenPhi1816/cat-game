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
import type { CookScreenProps } from '../navigation/types';

interface Ingredient {
  item_name: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  energy_recovery: number;
  experience_reward: number;
  happiness_bonus: number;
  required_care_level: number;
}

interface InventoryMap {
  [itemName: string]: number;
}

export default function CookScreen({ route, navigation }: CookScreenProps) {
  const { catId } = route.params;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [invMap, setInvMap] = useState<InventoryMap>({});
  const [loading, setLoading] = useState(true);
  const [cooking, setCooking] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [recipesRes, invRes] = await Promise.all([
        apiClient.get('/economy/recipes'),
        apiClient.get('/economy/inventory'),
      ]);
      setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : []);
      const map: InventoryMap = {};
      (Array.isArray(invRes.data) ? invRes.data : []).forEach(
        (e: { item: { name: string }; quantity: number }) => {
          if (e.item?.name) map[e.item.name] = e.quantity;
        },
      );
      setInvMap(map);
    } catch {
      Alert.alert('Error', 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const canCook = useCallback((recipe: Recipe) => {
    return (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).every(
      (ing) => (invMap[ing.item_name] ?? 0) >= ing.quantity,
    );
  }, [invMap]);

  const handleCook = useCallback(async (recipe: Recipe) => {
    setCooking(recipe.id);
    try {
      const res = await apiClient.post(`/cats/${catId}/cook`, { recipe_id: recipe.id });
      Alert.alert(
        '🍳 Cooked!',
        `${recipe.name} was prepared!\n+${res.data.xp_gained} XP${res.data.leveled_up ? '\n🎉 Level Up!' : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Failed', 'Missing ingredients or cat lacks energy.');
    } finally {
      setCooking(null);
    }
  }, [catId, navigation]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No recipes available</Text>}
      renderItem={({ item: recipe }) => {
        const cookable = canCook(recipe);
        return (
          <View style={[styles.card, !cookable && styles.cardDisabled]}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <View style={styles.ingredients}>
              {(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((ing, i) => {
                const have = invMap[ing.item_name] ?? 0;
                return (
                  <Text key={i} style={[styles.ingredient, have < ing.quantity && styles.missing]}>
                    {ing.item_name} x{ing.quantity} ({have} owned)
                  </Text>
                );
              })}
            </View>
            <View style={styles.rewards}>
              <Text style={styles.reward}>⚡ -{(recipe.energy_recovery * 100).toFixed(0)}% hunger</Text>
              <Text style={styles.reward}>✨ +{recipe.experience_reward} XP</Text>
              <Text style={styles.reward}>😊 +{(recipe.happiness_bonus * 100).toFixed(0)}% happy</Text>
            </View>
            <TouchableOpacity
              style={[styles.cookBtn, !cookable && styles.cookBtnDisabled]}
              onPress={() => handleCook(recipe)}
              disabled={!cookable || cooking === recipe.id}
            >
              {cooking === recipe.id
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.cookBtnText}>{cookable ? 'Cook 🍳' : 'Missing ingredients'}</Text>
              }
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#999', padding: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  cardDisabled: { opacity: 0.7 },
  recipeName: { fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  ingredients: { marginBottom: 8 },
  ingredient: { fontSize: 13, color: '#555' },
  missing: { color: '#f44336' },
  rewards: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  reward: { fontSize: 12, color: '#666', backgroundColor: '#f0f0ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cookBtn: { backgroundColor: '#6c63ff', borderRadius: 8, padding: 12, alignItems: 'center' },
  cookBtnDisabled: { backgroundColor: '#ccc' },
  cookBtnText: { color: '#fff', fontWeight: '600' },
});

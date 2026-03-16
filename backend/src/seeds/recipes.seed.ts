export const DEFAULT_RECIPES = [
  {
    name: 'Fish Soup',
    ingredients: [
      { item_name: 'Fish', quantity: 1 },
      { item_name: 'Milk', quantity: 1 },
    ],
    energy_recovery: 0.5,
    experience_reward: 15,
    happiness_bonus: 0.2,
    required_care_level: 1,
  },
  {
    name: 'Steak',
    ingredients: [
      { item_name: 'Meat', quantity: 1 },
      { item_name: 'Vegetables', quantity: 1 },
    ],
    energy_recovery: 0.7,
    experience_reward: 20,
    happiness_bonus: 0.3,
    required_care_level: 1,
  },
  {
    name: 'Veggie Salad',
    ingredients: [{ item_name: 'Vegetables', quantity: 2 }],
    energy_recovery: 0.3,
    experience_reward: 10,
    happiness_bonus: 0.1,
    required_care_level: 1,
  },
];

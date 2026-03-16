import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Fish Soup"

  @Column({ type: 'jsonb' })
  ingredients: { item_id: string; quantity: number }[];

  @Column({ type: 'float', default: 0 })
  energy_recovery: number;

  @Column({ default: 0 })
  experience_reward: number;

  @Column({ type: 'float', default: 0 })
  happiness_bonus: number;

  @Column({ default: 1 })
  required_care_level: number;
}

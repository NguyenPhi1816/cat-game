import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column()
  name: string;

  @Column({ default: 'playful' })
  personality_type: string; // chef, lazy, clean_freak, playful

  @Column({ type: 'float', default: 0.5 })
  intelligence: number;

  @Column({ type: 'float', default: 0.5 })
  kindness: number;

  @Column({ type: 'float', default: 1.0 })
  energy: number;

  @Column({ type: 'float', default: 0.5 })
  loyalty: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 1 })
  care_level: number;

  @Column({ type: 'float', default: 1.0 })
  happiness: number;

  @CreateDateColumn()
  created_at: Date;
}

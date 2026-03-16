import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('player_profiles')
export class PlayerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  player_name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @CreateDateColumn()
  created_at: Date;
}

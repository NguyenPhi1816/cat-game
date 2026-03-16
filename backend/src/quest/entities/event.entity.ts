import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class GameEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column()
  event_type: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}

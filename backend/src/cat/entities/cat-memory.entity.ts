import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_memories')
export class CatMemory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cat_id: string;

  @Column()
  memory_type: string; // praised, ignored, saved_money, got_sick

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', default: 1.0 })
  importance: number; // 0.0 to 1.0

  @CreateDateColumn()
  created_at: Date;
}

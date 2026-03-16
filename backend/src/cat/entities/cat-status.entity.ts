import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_status')
export class CatStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cat_id: string;

  @Column({ type: 'float', default: 0.0 })
  hunger: number;

  @Column({ type: 'float', default: 1.0 })
  happiness: number;

  @Column({ type: 'float', default: 0.0 })
  stress: number;

  @Column({ type: 'timestamp', nullable: true })
  last_action_time: Date;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_jobs')
export class CatJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cat_id: string;

  @Column()
  job_id: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ default: 'in_progress' })
  status: string; // in_progress, completed, cancelled
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  reward_money: number;

  @Column()
  duration: number; // in minutes
}

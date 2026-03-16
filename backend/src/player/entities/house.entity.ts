import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('houses')
export class House {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @CreateDateColumn()
  created_at: Date;
}

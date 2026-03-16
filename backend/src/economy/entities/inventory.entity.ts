import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column()
  item_id: string;

  @Column({ default: 1 })
  quantity: number;
}

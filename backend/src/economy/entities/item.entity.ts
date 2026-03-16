import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // ingredient, furniture, recipe

  @Column({ type: 'float' })
  price: number;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  house_id: string;

  @Column()
  name: string; // kitchen, living_room, bedroom, bathroom

  @Column({ default: 1 })
  level: number;
}

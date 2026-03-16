import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column({ type: 'float', default: 100 })
  money: number;

  @Column({ type: 'float', default: 0 })
  premium_currency: number;
}

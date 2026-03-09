import { Injectable } from '@nestjs/common';
import { WalletDto } from './dto/wallet.dto';

@Injectable()
export class EconomyService {
  async getWallet(playerId: string): Promise<WalletDto | null> {
    // TODO: query wallets by player_id
    return null;
  }

  async createWallet(playerId: string): Promise<WalletDto> {
    // TODO: insert into wallets table
    return {
      playerId,
      money: 0,
      premiumCurrency: 0,
    };
  }

  async addMoney(playerId: string, amount: number): Promise<WalletDto> {
    // TODO: update wallets set money = money + amount
    return {
      playerId,
      money: amount,
      premiumCurrency: 0,
    };
  }

  async spendMoney(playerId: string, amount: number): Promise<WalletDto> {
    // TODO: check balance, update wallets set money = money - amount
    return {
      playerId,
      money: -amount,
      premiumCurrency: 0,
    };
  }
}

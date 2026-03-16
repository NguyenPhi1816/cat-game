import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomyController } from './economy.controller';
import { EconomyService } from './economy.service';
import { Wallet } from './entities/wallet.entity';
import { Item } from './entities/item.entity';
import { Inventory } from './entities/inventory.entity';
import { Recipe } from './entities/recipe.entity';
import { PlayerProfile } from '../player/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Item, Inventory, Recipe, PlayerProfile])],
  controllers: [EconomyController],
  providers: [EconomyService],
  exports: [EconomyService],
})
export class EconomyModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PlayerProfile } from './entities/player.entity';
import { House } from './entities/house.entity';
import { Room } from './entities/room.entity';
import { Wallet } from '../economy/entities/wallet.entity';
import { User } from '../auth/entities/user.entity';
import { Cat } from '../cat/entities/cat.entity';
import { CatStatus } from '../cat/entities/cat-status.entity';
import { CatMemory } from '../cat/entities/cat-memory.entity';
import { OfflineService } from './services/offline.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerProfile, House, Room, Wallet, User, Cat, CatStatus, CatMemory]),
    HttpModule,
    AiModule,
  ],
  controllers: [PlayerController],
  providers: [PlayerService, OfflineService],
  exports: [PlayerService, OfflineService],
})
export class PlayerModule {}

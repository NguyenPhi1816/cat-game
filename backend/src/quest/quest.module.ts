import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { Job } from './entities/job.entity';
import { CatJob } from './entities/cat-job.entity';
import { GameEvent } from './entities/event.entity';
import { Cat } from '../cat/entities/cat.entity';
import { CatMemory } from '../cat/entities/cat-memory.entity';
import { Wallet } from '../economy/entities/wallet.entity';
import { PlayerProfile } from '../player/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      CatJob,
      GameEvent,
      Cat,
      CatMemory,
      Wallet,
      PlayerProfile,
    ]),
  ],
  controllers: [QuestController],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule {}

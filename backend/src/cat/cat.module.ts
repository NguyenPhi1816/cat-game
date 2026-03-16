import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatController } from './cat.controller';
import { CatService } from './cat.service';
import { Cat } from './entities/cat.entity';
import { CatStatus } from './entities/cat-status.entity';
import { CatMemory } from './entities/cat-memory.entity';
import { LevelingService } from './services/leveling.service';
import { PersonalityService } from './services/personality.service';
import { Inventory } from '../economy/entities/inventory.entity';
import { Item } from '../economy/entities/item.entity';
import { Recipe } from '../economy/entities/recipe.entity';
import { PlayerProfile } from '../player/entities/player.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cat, CatStatus, CatMemory, Inventory, Item, Recipe, PlayerProfile]),
    HttpModule,
    AiModule,
  ],
  controllers: [CatController],
  providers: [CatService, LevelingService, PersonalityService],
  exports: [CatService, LevelingService, PersonalityService],
})
export class CatModule {}

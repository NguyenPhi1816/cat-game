import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { CatModule } from './cat/cat.module';
import { EconomyModule } from './economy/economy.module';
import { QuestModule } from './quest/quest.module';

@Module({
  imports: [AuthModule, PlayerModule, CatModule, EconomyModule, QuestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

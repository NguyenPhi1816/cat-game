import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { CatModule } from './cat/cat.module';
import { EconomyModule } from './economy/economy.module';
import { QuestModule } from './quest/quest.module';
import configuration from './config/configuration';
import { SeedService } from './seeds/seed.service';
import { Item } from './economy/entities/item.entity';
import { Job } from './quest/entities/job.entity';
import { Recipe } from './economy/entities/recipe.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true, // disable in production
    }),
    TypeOrmModule.forFeature([Item, Job, Recipe]),
    AuthModule,
    PlayerModule,
    CatModule,
    EconomyModule,
    QuestModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

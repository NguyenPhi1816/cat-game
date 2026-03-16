import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.get<string>('aiService.url') ?? 'http://localhost:8000';
  }

  async generatePersonality(playerId: string, seed?: number, playerPreference?: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/personality/generate`, {
          player_id: playerId,
          seed,
          player_preference: playerPreference,
        }),
      );
      return data;
    } catch (err) {
      this.logger.warn(`generatePersonality failed: ${err}`);
      return null;
    }
  }

  async planBehavior(
    catId: string,
    catStatus: object,
    personality: object,
    economyState: object,
    playerState: object,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/behavior/plan`, {
          cat_id: catId,
          cat_status: catStatus,
          personality,
          economy_state: economyState,
          player_state: playerState,
        }),
      );
      return data;
    } catch (err) {
      this.logger.warn(`planBehavior failed: ${err}`);
      return null;
    }
  }

  async generateNarrative(
    catId: string,
    actions: string[],
    hours: number,
    personalityType?: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/narrative/generate`, {
          cat_id: catId,
          actions_taken: actions,
          time_elapsed_hours: hours,
          personality_type: personalityType,
        }),
      );
      return data as { cat_id: string; summary: string };
    } catch (err) {
      this.logger.warn(`generateNarrative failed: ${err}`);
      return null;
    }
  }

  async generateEvent(playerId: string, catId: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/events/random`, {
          player_id: playerId,
          cat_id: catId,
        }),
      );
      return data;
    } catch (err) {
      this.logger.warn(`generateEvent failed: ${err}`);
      return null;
    }
  }

  async analyzeMemories(catId: string, memories: object[]) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/memory/analyze`, {
          cat_id: catId,
          memories,
        }),
      );
      return data as { mood_modifier: number; behavior_bias: string; reason: string };
    } catch (err) {
      this.logger.warn(`analyzeMemories failed: ${err}`);
      return null;
    }
  }

  async offlineSimulate(
    playerId: string,
    cats: object[],
    hoursAway: number,
    economyState: object,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/offline/simulate`, {
          player_id: playerId,
          cats,
          hours_away: hoursAway,
          economy_state: economyState,
        }),
      );
      return data;
    } catch (err) {
      this.logger.warn(`offlineSimulate failed: ${err}`);
      return null;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerProfileDto } from './dto/player-profile.dto';

@Injectable()
export class PlayerService {
  async create(userId: string, dto: CreatePlayerDto): Promise<PlayerProfileDto> {
    // TODO: insert into player_profiles table
    return {
      id: 'generated-id',
      playerName: dto.playerName,
      level: 1,
      experience: 0,
    };
  }

  async findByUserId(userId: string): Promise<PlayerProfileDto | null> {
    // TODO: query player_profiles by user_id
    return null;
  }

  async findById(id: string): Promise<PlayerProfileDto | null> {
    // TODO: query player_profiles by id
    return null;
  }
}

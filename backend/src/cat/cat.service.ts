import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatStatusDto } from './dto/cat-status.dto';

@Injectable()
export class CatService {
  async create(playerId: string, dto: CreateCatDto) {
    // TODO: insert into cats table with default stats
    return {
      id: 'generated-id',
      playerId,
      name: dto.name,
      personalityType: dto.personalityType,
      intelligence: 50,
      kindness: 50,
      energy: 100,
      loyalty: 50,
    };
  }

  async findByPlayerId(playerId: string) {
    // TODO: query cats by player_id
    return [];
  }

  async getStatus(catId: string): Promise<CatStatusDto | null> {
    // TODO: query cat_status by cat_id
    return null;
  }

  async findById(id: string) {
    // TODO: query cats by id
    return null;
  }
}

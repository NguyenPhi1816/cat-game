import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  create(@Body() dto: CreatePlayerDto) {
    // TODO: extract userId from JWT
    const userId = 'current-user-id';
    return this.playerService.create(userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playerService.findById(id);
  }
}

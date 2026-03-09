import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CatService } from './cat.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Post()
  create(@Body() dto: CreateCatDto) {
    // TODO: extract playerId from JWT/session
    const playerId = 'current-player-id';
    return this.catService.create(playerId, dto);
  }

  @Get('player/:playerId')
  findByPlayer(@Param('playerId') playerId: string) {
    return this.catService.findByPlayerId(playerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catService.findById(id);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.catService.getStatus(id);
  }
}

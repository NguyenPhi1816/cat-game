import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PlayerService } from './player.service';
import { UpdatePlayerDto } from './dto/update-player.dto';

@UseGuards(JwtAuthGuard)
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('daily-report')
  getDailyReport(@CurrentUser() user: { userId: string }) {
    return this.playerService.getDailyReport(user.userId);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.playerService.getProfile(user.userId);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playerService.updateProfile(user.userId, dto);
  }

  @Get('house')
  getHouse(@CurrentUser() user: { userId: string }) {
    return this.playerService.getHouse(user.userId);
  }

  @Post('house/rooms/:roomId/upgrade')
  upgradeRoom(
    @CurrentUser() user: { userId: string },
    @Param('roomId') roomId: string,
  ) {
    return this.playerService.upgradeRoom(user.userId, roomId);
  }
}

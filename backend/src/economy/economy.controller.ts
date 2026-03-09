import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { EconomyService } from './economy.service';

@Controller('economy')
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Get('wallet/:playerId')
  getWallet(@Param('playerId') playerId: string) {
    return this.economyService.getWallet(playerId);
  }

  @Post('wallet')
  createWallet(@Body('playerId') playerId: string) {
    return this.economyService.createWallet(playerId);
  }

  @Post('wallet/:playerId/add')
  addMoney(
    @Param('playerId') playerId: string,
    @Body('amount') amount: number,
  ) {
    return this.economyService.addMoney(playerId, amount);
  }

  @Post('wallet/:playerId/spend')
  spendMoney(
    @Param('playerId') playerId: string,
    @Body('amount') amount: number,
  ) {
    return this.economyService.spendMoney(playerId, amount);
  }
}

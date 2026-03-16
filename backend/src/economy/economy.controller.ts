import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EconomyService } from './economy.service';
import { BuyItemDto } from './dto/buy-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('economy')
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Get('wallet')
  getWallet(@CurrentUser() user: { userId: string }) {
    return this.economyService.getWallet(user.userId);
  }

  @Get('shop')
  getShopItems() {
    return this.economyService.getShopItems();
  }

  @Get('recipes')
  getRecipes() {
    return this.economyService.getRecipes();
  }

  @Post('buy')
  buyItem(
    @CurrentUser() user: { userId: string },
    @Body() dto: BuyItemDto,
  ) {
    return this.economyService.buyItem(user.userId, dto);
  }

  @Get('inventory')
  getInventory(@CurrentUser() user: { userId: string }) {
    return this.economyService.getInventory(user.userId);
  }
}

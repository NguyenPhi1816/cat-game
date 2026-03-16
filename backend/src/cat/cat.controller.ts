import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CatService } from './cat.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { FeedCatDto } from './dto/feed-cat.dto';
import { CookDto } from './dto/cook.dto';

@UseGuards(JwtAuthGuard)
@Controller('cats')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCatDto,
  ) {
    return this.catService.createCat(user.userId, dto);
  }

  @Get()
  getCats(@CurrentUser() user: { userId: string }) {
    return this.catService.getCats(user.userId);
  }

  @Get(':catId')
  getCat(
    @CurrentUser() user: { userId: string },
    @Param('catId') catId: string,
  ) {
    return this.catService.getCat(user.userId, catId);
  }

  @Post(':catId/feed')
  feedCat(
    @CurrentUser() user: { userId: string },
    @Param('catId') catId: string,
    @Body() dto: FeedCatDto,
  ) {
    return this.catService.feedCat(user.userId, catId, dto);
  }

  @Post(':catId/cook')
  cook(
    @CurrentUser() user: { userId: string },
    @Param('catId') catId: string,
    @Body() dto: CookDto,
  ) {
    return this.catService.cook(user.userId, catId, dto);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QuestService } from './quest.service';
import { AssignJobDto } from './dto/assign-job.dto';

@UseGuards(JwtAuthGuard)
@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get('jobs')
  getJobs() {
    return this.questService.getJobs();
  }

  @Post('assign')
  assignJob(
    @CurrentUser() user: { userId: string },
    @Body() dto: AssignJobDto,
  ) {
    return this.questService.assignJob(user.userId, dto);
  }

  @Post('complete/:catJobId')
  completeJob(
    @CurrentUser() user: { userId: string },
    @Param('catJobId') catJobId: string,
  ) {
    return this.questService.completeJob(user.userId, catJobId);
  }

  @Get('active')
  getActiveJobs(@CurrentUser() user: { userId: string }) {
    return this.questService.getActiveJobs(user.userId);
  }
}

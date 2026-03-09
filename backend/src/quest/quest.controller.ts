import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post('jobs')
  createJob(@Body() dto: CreateJobDto) {
    return this.questService.createJob(dto);
  }

  @Get('jobs')
  findAllJobs() {
    return this.questService.findAllJobs();
  }

  @Get('jobs/:id')
  findJob(@Param('id') id: string) {
    return this.questService.findJobById(id);
  }

  @Post('jobs/:jobId/assign/:catId')
  assignCat(
    @Param('jobId') jobId: string,
    @Param('catId') catId: string,
  ) {
    return this.questService.assignCatToJob(catId, jobId);
  }

  @Get('cats/:catId/jobs')
  getCatJobs(@Param('catId') catId: string) {
    return this.questService.getCatJobs(catId);
  }
}

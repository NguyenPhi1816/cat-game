import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class QuestService {
  async createJob(dto: CreateJobDto) {
    // TODO: insert into jobs table
    return {
      id: 'generated-id',
      name: dto.name,
      rewardMoney: dto.rewardMoney,
      duration: dto.duration,
    };
  }

  async findAllJobs() {
    // TODO: query all jobs
    return [];
  }

  async findJobById(id: string) {
    // TODO: query jobs by id
    return null;
  }

  async assignCatToJob(catId: string, jobId: string) {
    // TODO: insert into cat_jobs with start_time and calculated end_time
    return {
      id: 'generated-id',
      catId,
      jobId,
      startTime: new Date(),
      endTime: null,
      status: 'in_progress',
    };
  }

  async getCatJobs(catId: string) {
    // TODO: query cat_jobs by cat_id
    return [];
  }
}

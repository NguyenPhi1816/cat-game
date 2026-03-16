import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CatJob } from './entities/cat-job.entity';
import { Cat } from '../cat/entities/cat.entity';
import { CatMemory } from '../cat/entities/cat-memory.entity';
import { Wallet } from '../economy/entities/wallet.entity';
import { PlayerProfile } from '../player/entities/player.entity';
import { AssignJobDto } from './dto/assign-job.dto';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(CatJob)
    private readonly catJobRepo: Repository<CatJob>,
    @InjectRepository(Cat)
    private readonly catRepo: Repository<Cat>,
    @InjectRepository(CatMemory)
    private readonly catMemoryRepo: Repository<CatMemory>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(PlayerProfile)
    private readonly playerRepo: Repository<PlayerProfile>,
  ) {}

  // 6.1
  async getJobs() {
    return this.jobRepo.find();
  }

  // 6.2
  async assignJob(userId: string, dto: AssignJobDto) {
    const player = await this._getPlayer(userId);
    const cat = await this.catRepo.findOne({ where: { id: dto.cat_id } });
    if (!cat || cat.player_id !== player.id) {
      throw new NotFoundException('Cat not found');
    }

    const activeJob = await this.catJobRepo.findOne({
      where: { cat_id: cat.id, status: 'in_progress' },
    });
    if (activeJob) {
      throw new BadRequestException('Cat is already on a job');
    }

    if (cat.energy < 0.3) {
      throw new BadRequestException('Cat does not have enough energy (need 0.3)');
    }

    if (cat.care_level < 1) {
      throw new BadRequestException('Cat care level too low for jobs');
    }

    const job = await this.jobRepo.findOne({ where: { id: dto.job_id } });
    if (!job) throw new NotFoundException('Job not found');

    const now = new Date();
    const endTime = new Date(now.getTime() + job.duration * 60 * 1000);

    cat.energy = Math.max(0, cat.energy - 0.3);
    await this.catRepo.save(cat);

    const catJob = this.catJobRepo.create({
      cat_id: cat.id,
      job_id: job.id,
      start_time: now,
      end_time: endTime,
      status: 'in_progress',
    });
    return this.catJobRepo.save(catJob);
  }

  // 6.3
  async completeJob(userId: string, catJobId: string) {
    const player = await this._getPlayer(userId);
    const catJob = await this.catJobRepo.findOne({ where: { id: catJobId } });
    if (!catJob) throw new NotFoundException('Cat job not found');

    const cat = await this.catRepo.findOne({ where: { id: catJob.cat_id } });
    if (!cat || cat.player_id !== player.id) {
      throw new NotFoundException('Cat job not found');
    }

    if (catJob.status !== 'in_progress') {
      throw new BadRequestException('Job is not in progress');
    }

    if (new Date() < catJob.end_time) {
      throw new BadRequestException('Job not finished yet');
    }

    const job = await this.jobRepo.findOne({ where: { id: catJob.job_id } });
    if (!job) throw new NotFoundException('Job definition not found');

    // Award money
    const wallet = await this.walletRepo.findOne({ where: { player_id: player.id } });
    if (wallet) {
      wallet.money += job.reward_money;
      await this.walletRepo.save(wallet);
    }

    // Award XP and level up
    const xpGained = Math.floor(job.duration / 10);
    cat.experience += xpGained;
    const xpThreshold = cat.level * 100;
    if (cat.experience >= xpThreshold) {
      cat.experience -= xpThreshold;
      cat.level += 1;
    }
    await this.catRepo.save(cat);

    // Create memory
    await this.catMemoryRepo.save(
      this.catMemoryRepo.create({
        cat_id: cat.id,
        memory_type: 'completed_job',
        description: `Worked as ${job.name}`,
        importance: 0.6,
      }),
    );

    catJob.status = 'completed';
    await this.catJobRepo.save(catJob);

    return {
      reward_money: job.reward_money,
      xp_gained: xpGained,
      cat_level: cat.level,
      wallet_balance: wallet?.money ?? 0,
    };
  }

  // 6.4
  async getActiveJobs(userId: string) {
    const player = await this._getPlayer(userId);
    const cats = await this.catRepo.find({ where: { player_id: player.id } });
    if (!cats.length) return [];

    const catIds = cats.map((c) => c.id);
    const activeJobs = await this.catJobRepo
      .createQueryBuilder('cj')
      .where('cj.cat_id IN (:...catIds)', { catIds })
      .andWhere('cj.status = :status', { status: 'in_progress' })
      .getMany();

    const now = new Date();
    return Promise.all(
      activeJobs.map(async (cj) => {
        const job = await this.jobRepo.findOne({ where: { id: cj.job_id } });
        const remainingMs = Math.max(0, cj.end_time.getTime() - now.getTime());
        return {
          ...cj,
          job,
          remaining_seconds: Math.floor(remainingMs / 1000),
        };
      }),
    );
  }

  private async _getPlayer(userId: string) {
    const player = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!player) throw new NotFoundException('Player profile not found');
    return player;
  }
}

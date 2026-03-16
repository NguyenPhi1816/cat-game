import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { House } from './entities/house.entity';
import { PlayerProfile } from './entities/player.entity';
import { Room } from './entities/room.entity';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Wallet } from '../economy/entities/wallet.entity';
import { User } from '../auth/entities/user.entity';
import { Cat } from '../cat/entities/cat.entity';
import { CatStatus } from '../cat/entities/cat-status.entity';
import { CatMemory } from '../cat/entities/cat-memory.entity';
import { OfflineService } from './services/offline.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(PlayerProfile)
    private readonly playerRepo: Repository<PlayerProfile>,
    @InjectRepository(House)
    private readonly houseRepo: Repository<House>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Cat)
    private readonly catRepo: Repository<Cat>,
    @InjectRepository(CatStatus)
    private readonly catStatusRepo: Repository<CatStatus>,
    @InjectRepository(CatMemory)
    private readonly catMemoryRepo: Repository<CatMemory>,
    private readonly offlineService: OfflineService,
    private readonly aiService: AiService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Player profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdatePlayerDto) {
    const profile = await this.getProfile(userId);
    if (dto.player_name) profile.player_name = dto.player_name;
    return this.playerRepo.save(profile);
  }

  async getHouse(userId: string) {
    const house = await this.houseRepo.findOne({ where: { player_id: userId } });
    if (!house) throw new NotFoundException('House not found');
    const rooms = await this.roomRepo.find({ where: { house_id: house.id } });
    return { house, rooms };
  }

  async upgradeRoom(userId: string, roomId: string) {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    // Verify room belongs to the player's house
    const house = await this.houseRepo.findOne({ where: { id: room.house_id, player_id: userId } });
    if (!house) throw new NotFoundException('Room not found');

    const cost = room.level * 50;
    const wallet = await this.walletRepo.findOne({ where: { player_id: userId } });
    if (!wallet || wallet.money < cost) {
      throw new BadRequestException(`Insufficient funds. Upgrade costs ${cost} coins`);
    }

    wallet.money -= cost;
    await this.walletRepo.save(wallet);

    room.level += 1;
    return this.roomRepo.save(room);
  }

  // 8.3
  async getDailyReport(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const lastLogin = user.last_login ?? user.created_at;

    // Less than 1 minute since last login — no report
    const minutesAway = (now.getTime() - lastLogin.getTime()) / (1000 * 60);
    if (minutesAway < 1) {
      return { has_report: false };
    }

    const player = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!player) throw new NotFoundException('Player profile not found');

    // Calculate salary
    const rewards = this.offlineService.calculateOfflineRewards(lastLogin, now, player.level);

    // Award salary to wallet
    const wallet = await this.walletRepo.findOne({ where: { player_id: player.id } });
    if (wallet) {
      wallet.money += rewards.salary_earned;
      await this.walletRepo.save(wallet);
    }

    // Simulate cat actions
    const cats = await this.catRepo.find({ where: { player_id: player.id } });
    const catReports = this.offlineService.simulateCatActions(cats, rewards.hours_away);

    // Apply cat state changes
    for (const report of catReports) {
      const cat = cats.find((c) => c.id === report.cat_id)!;
      cat.experience += report.xp_gained;
      const xpThreshold = cat.level * 100;
      let leveledUp = false;
      if (cat.experience >= xpThreshold) {
        cat.experience -= xpThreshold;
        cat.level += 1;
        leveledUp = true;
      }
      await this.catRepo.save(cat);

      const status = await this.catStatusRepo.findOne({ where: { cat_id: cat.id } });
      if (status) {
        status.hunger = Math.min(1.0, status.hunger + report.status_changes.hunger_increase);
        status.last_action_time = now;
        await this.catStatusRepo.save(status);
      }

      (report as any).leveled_up = leveledUp;
    }

    // Get AI narrative per cat, combine into single story
    let narrative = `While you were away for ${rewards.hours_away} hours, your cats kept things running.`;
    const narrativeParts = await Promise.all(
      catReports.map(async (report) => {
        const cat = cats.find((c) => c.id === report.cat_id);
        const result = await this.aiService.generateNarrative(
          report.cat_id,
          report.actions_performed,
          rewards.hours_away,
          cat?.personality_type,
        );
        return result?.summary ?? null;
      }),
    );
    const validParts = narrativeParts.filter(Boolean) as string[];
    if (validParts.length > 0) narrative = validParts.join(' ');

    // Update last_login
    user.last_login = now;
    await this.userRepo.save(user);

    return {
      has_report: true,
      hours_away: rewards.hours_away,
      salary_earned: rewards.salary_earned,
      capped: rewards.capped,
      cat_reports: catReports,
      narrative,
      events: [],
    };
  }

  // Used internally during registration
  async createProfileWithHouse(userId: string, playerName: string) {
    const profile = this.playerRepo.create({ user_id: userId, player_name: playerName });
    await this.playerRepo.save(profile);

    const house = this.houseRepo.create({ player_id: userId });
    await this.houseRepo.save(house);

    const roomNames = ['kitchen', 'living_room', 'bedroom', 'bathroom'];
    const rooms = roomNames.map((name) => this.roomRepo.create({ house_id: house.id, name }));
    await this.roomRepo.save(rooms);

    const wallet = this.walletRepo.create({ player_id: userId, money: 100 });
    await this.walletRepo.save(wallet);

    return profile;
  }
}

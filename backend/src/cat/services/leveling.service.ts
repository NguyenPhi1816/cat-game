import { Injectable } from '@nestjs/common';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class LevelingService {
  getExperienceForLevel(level: number): number {
    return level * 100; // 100 XP per level
  }

  getCareLevel(level: number): number {
    if (level >= 10) return 5; // Manage house automatically
    if (level >= 7) return 4;  // Prepare work supplies
    if (level >= 5) return 3;  // Buy groceries
    if (level >= 3) return 2;  // Clean rooms
    return 1;                  // Cook simple meals
  }

  checkLevelUp(cat: Cat): { leveled: boolean; newLevel: number; newCareLevel: number } {
    const required = this.getExperienceForLevel(cat.level);
    if (cat.experience >= required) {
      const newLevel = cat.level + 1;
      return { leveled: true, newLevel, newCareLevel: this.getCareLevel(newLevel) };
    }
    return { leveled: false, newLevel: cat.level, newCareLevel: cat.care_level };
  }
}

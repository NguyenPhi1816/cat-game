import { Injectable } from '@nestjs/common';
import { Cat } from '../../cat/entities/cat.entity';

export interface OfflineRewards {
  hours_away: number;
  salary_earned: number;
  capped: boolean;
}

export interface CatActionReport {
  cat_id: string;
  cat_name: string;
  actions_performed: string[];
  xp_gained: number;
  status_changes: {
    hunger_increase: number;
    energy_decrease: number;
  };
}

@Injectable()
export class OfflineService {
  // 8.1
  calculateOfflineRewards(lastLogin: Date, now: Date, playerLevel: number): OfflineRewards {
    let hoursAway = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    const capped = hoursAway >= 8;
    hoursAway = Math.min(hoursAway, 8);

    const efficiency = 0.35;
    const salaryPerHour = 10 + playerLevel * 2;
    const salary = Math.floor(hoursAway * salaryPerHour * efficiency);

    return {
      hours_away: Math.round(hoursAway * 10) / 10,
      salary_earned: salary,
      capped,
    };
  }

  // 8.2
  simulateCatActions(cats: Cat[], hoursAway: number): CatActionReport[] {
    return cats.map((cat) => {
      const actionCount = Math.floor(hoursAway * 0.5);
      const actions = this._pickActions(cat, actionCount);
      const xpGained = actions.length * 5;

      return {
        cat_id: cat.id,
        cat_name: cat.name,
        actions_performed: actions,
        xp_gained: xpGained,
        status_changes: {
          hunger_increase: actions.length * 0.1,
          energy_decrease: actions.length * 0.1,
        },
      };
    });
  }

  private _pickActions(cat: Cat, count: number): string[] {
    const actionsByPersonality: Record<string, string[]> = {
      chef: ['Cooked a simple meal', 'Prepared snacks', 'Tidied the kitchen'],
      clean_freak: ['Cleaned the living room', 'Swept the bedroom', 'Wiped the counters'],
      lazy: ['Napped on the couch', 'Watched the window', 'Stretched lazily'],
      playful: ['Chased a toy mouse', 'Played with yarn', 'Jumped on the bed'],
    };

    const pool = actionsByPersonality[cat.personality_type] ?? actionsByPersonality['playful'];
    const actions: string[] = [];
    for (let i = 0; i < count; i++) {
      actions.push(pool[i % pool.length]);
    }
    return actions;
  }
}

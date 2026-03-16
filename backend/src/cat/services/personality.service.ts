import { Injectable } from '@nestjs/common';

interface PersonalityModifiers {
  cook_speed: number;
  clean_speed: number;
  energy_cost: number;
  happiness_bonus: number;
}

@Injectable()
export class PersonalityService {
  getModifiers(personalityType: string): PersonalityModifiers {
    const modifiers: Record<string, PersonalityModifiers> = {
      chef:        { cook_speed: 1.5, clean_speed: 1.0, energy_cost: 1.0, happiness_bonus: 1.0 },
      lazy:        { cook_speed: 0.8, clean_speed: 0.8, energy_cost: 0.7, happiness_bonus: 1.0 },
      clean_freak: { cook_speed: 1.0, clean_speed: 1.5, energy_cost: 1.0, happiness_bonus: 1.0 },
      playful:     { cook_speed: 1.0, clean_speed: 1.0, energy_cost: 1.0, happiness_bonus: 1.5 },
    };
    return modifiers[personalityType] ?? modifiers['playful'];
  }
}

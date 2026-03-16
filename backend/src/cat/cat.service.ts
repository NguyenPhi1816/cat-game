import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './entities/cat.entity';
import { CatStatus } from './entities/cat-status.entity';
import { CatMemory } from './entities/cat-memory.entity';
import { CreateCatDto } from './dto/create-cat.dto';
import { FeedCatDto } from './dto/feed-cat.dto';
import { CookDto } from './dto/cook.dto';
import { LevelingService } from './services/leveling.service';
import { Inventory } from '../economy/entities/inventory.entity';
import { Item } from '../economy/entities/item.entity';
import { Recipe } from '../economy/entities/recipe.entity';
import { PlayerProfile } from '../player/entities/player.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CatService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepo: Repository<Cat>,
    @InjectRepository(CatStatus)
    private readonly catStatusRepo: Repository<CatStatus>,
    @InjectRepository(CatMemory)
    private readonly catMemoryRepo: Repository<CatMemory>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(PlayerProfile)
    private readonly playerRepo: Repository<PlayerProfile>,
    private readonly levelingService: LevelingService,
    private readonly aiService: AiService,
  ) {}

  async createCat(userId: string, dto: CreateCatDto) {
    const player = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!player) throw new NotFoundException('Player profile not found');

    const existingCats = await this.catRepo.count({ where: { player_id: player.id } });
    if (existingCats >= 3) {
      throw new BadRequestException('Free users can only have up to 3 cats');
    }

    let personalityType = dto.personality_type ?? 'playful';
    if (!dto.personality_type) {
      const aiResult = await this.aiService.generatePersonality(userId);
      if (aiResult?.personality) {
        personalityType = this._mapTraitsToType(aiResult.personality);
      }
    }

    const cat = this.catRepo.create({
      player_id: player.id,
      name: dto.name,
      personality_type: personalityType,
    });
    await this.catRepo.save(cat);

    const status = this.catStatusRepo.create({ cat_id: cat.id, hunger: 0, happiness: 1.0, stress: 0 });
    await this.catStatusRepo.save(status);

    return { ...cat, status };
  }

  async getCats(userId: string) {
    const player = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!player) throw new NotFoundException('Player profile not found');

    const cats = await this.catRepo.find({ where: { player_id: player.id } });
    return Promise.all(
      cats.map(async (cat) => {
        const status = await this.catStatusRepo.findOne({ where: { cat_id: cat.id } });
        return { ...cat, status };
      }),
    );
  }

  async getCat(userId: string, catId: string) {
    const cat = await this._findOwnedCat(userId, catId);
    const status = await this.catStatusRepo.findOne({ where: { cat_id: cat.id } });
    const memories = await this.catMemoryRepo.find({
      where: { cat_id: cat.id },
      order: { created_at: 'DESC' },
      take: 10,
    });
    return { ...cat, status, memories };
  }

  async feedCat(userId: string, catId: string, dto: FeedCatDto) {
    const cat = await this._findOwnedCat(userId, catId);

    const inventory = await this.inventoryRepo.findOne({
      where: { player_id: cat.player_id, item_id: dto.item_id },
    });
    if (!inventory || inventory.quantity < 1) {
      throw new BadRequestException('Item not found in inventory');
    }

    inventory.quantity -= 1;
    await this.inventoryRepo.save(inventory);

    const status = await this.catStatusRepo.findOne({ where: { cat_id: cat.id } });
    if (status) {
      status.hunger = Math.max(0, status.hunger - 0.3);
      status.happiness = Math.min(1.0, status.happiness + 0.1);
      status.last_action_time = new Date();
      await this.catStatusRepo.save(status);
    }

    cat.experience += 10;
    const levelUp = this.levelingService.checkLevelUp(cat);
    if (levelUp.leveled) {
      cat.level = levelUp.newLevel;
      cat.care_level = levelUp.newCareLevel;
      cat.experience = 0;
    }
    await this.catRepo.save(cat);

    return { cat, status };
  }

  async cook(userId: string, catId: string, dto: CookDto) {
    const cat = await this._findOwnedCat(userId, catId);

    const recipe = await this.recipeRepo.findOne({ where: { id: dto.recipe_id } });
    if (!recipe) throw new NotFoundException('Recipe not found');

    if (cat.care_level < recipe.required_care_level) {
      throw new BadRequestException(
        `Cat care level too low. Need ${recipe.required_care_level}`,
      );
    }

    if (cat.energy < 0.2) {
      throw new BadRequestException('Cat does not have enough energy to cook (need 0.2)');
    }

    // Verify and deduct all ingredients
    const ingredientList = recipe.ingredients as unknown as { item_name: string; quantity: number }[];
    for (const ingredient of ingredientList) {
      const item = await this.itemRepo.findOne({ where: { name: ingredient.item_name } });
      if (!item) throw new BadRequestException(`Unknown ingredient: ${ingredient.item_name}`);

      const inv = await this.inventoryRepo.findOne({
        where: { player_id: cat.player_id, item_id: item.id },
      });
      if (!inv || inv.quantity < ingredient.quantity) {
        throw new BadRequestException(`Not enough ${ingredient.item_name} in inventory`);
      }
    }

    for (const ingredient of ingredientList) {
      const item = await this.itemRepo.findOne({ where: { name: ingredient.item_name } });
      const inv = await this.inventoryRepo.findOne({
        where: { player_id: cat.player_id, item_id: item!.id },
      });
      inv!.quantity -= ingredient.quantity;
      await this.inventoryRepo.save(inv!);
    }

    // Apply personality modifier: chef gets +50% XP
    const xpMultiplier = cat.personality_type === 'chef' ? 1.5 : 1.0;
    const xpGained = Math.floor(recipe.experience_reward * xpMultiplier);

    cat.experience += xpGained;
    cat.happiness = Math.min(1.0, cat.happiness + recipe.happiness_bonus);
    cat.energy = Math.max(0, cat.energy - 0.2);
    const levelUp = this.levelingService.checkLevelUp(cat);
    if (levelUp.leveled) {
      cat.level = levelUp.newLevel;
      cat.care_level = levelUp.newCareLevel;
      cat.experience = 0;
    }
    await this.catRepo.save(cat);

    const status = await this.catStatusRepo.findOne({ where: { cat_id: cat.id } });
    if (status) {
      status.hunger = Math.max(0, status.hunger - recipe.energy_recovery);
      status.last_action_time = new Date();
      await this.catStatusRepo.save(status);
    }

    await this.catMemoryRepo.save(
      this.catMemoryRepo.create({
        cat_id: cat.id,
        memory_type: 'cooked_meal',
        description: `Cooked ${recipe.name}`,
        importance: 0.5,
      }),
    );

    return {
      recipe_name: recipe.name,
      xp_gained: xpGained,
      cat_level: cat.level,
      leveled_up: levelUp.leveled,
      energy_remaining: cat.energy,
      happiness: cat.happiness,
    };
  }

  private _mapTraitsToType(personality: {
    kindness: number;
    laziness: number;
    curiosity: number;
    playfulness: number;
    cleanliness: number;
  }): string {
    const scores: Record<string, number> = {
      chef: personality.curiosity + personality.kindness,
      lazy: personality.laziness * 2,
      clean_freak: personality.cleanliness * 2,
      playful: personality.playfulness + personality.curiosity,
    };
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  private async _findOwnedCat(userId: string, catId: string): Promise<Cat> {
    const player = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!player) throw new NotFoundException('Player profile not found');
    const cat = await this.catRepo.findOne({ where: { id: catId, player_id: player.id } });
    if (!cat) throw new NotFoundException('Cat not found');
    return cat;
  }
}

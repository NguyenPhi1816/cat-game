import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../economy/entities/item.entity';
import { Job } from '../quest/entities/job.entity';
import { Recipe } from '../economy/entities/recipe.entity';
import { DEFAULT_ITEMS } from './items.seed';
import { DEFAULT_JOBS } from './jobs.seed';
import { DEFAULT_RECIPES } from './recipes.seed';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
  ) {}

  async onModuleInit() {
    await this._seedItems();
    await this._seedJobs();
    await this._seedRecipes();
  }

  private async _seedItems() {
    const count = await this.itemRepo.count();
    if (count > 0) return;
    const items = DEFAULT_ITEMS.map((d) => this.itemRepo.create(d));
    await this.itemRepo.save(items);
  }

  private async _seedJobs() {
    const count = await this.jobRepo.count();
    if (count > 0) return;
    const jobs = DEFAULT_JOBS.map((d) => this.jobRepo.create(d));
    await this.jobRepo.save(jobs);
  }

  private async _seedRecipes() {
    const count = await this.recipeRepo.count();
    if (count > 0) return;
    // Resolve ingredient item_name references as JSON — stored as-is for UI display
    const recipes = DEFAULT_RECIPES.map((d) =>
      this.recipeRepo.create({
        name: d.name,
        ingredients: d.ingredients as any,
        energy_recovery: d.energy_recovery,
        experience_reward: d.experience_reward,
        happiness_bonus: d.happiness_bonus,
        required_care_level: d.required_care_level,
      }),
    );
    await this.recipeRepo.save(recipes);
  }
}

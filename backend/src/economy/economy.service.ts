import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Item } from './entities/item.entity';
import { Inventory } from './entities/inventory.entity';
import { Recipe } from './entities/recipe.entity';
import { PlayerProfile } from '../player/entities/player.entity';
import { BuyItemDto } from './dto/buy-item.dto';

@Injectable()
export class EconomyService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(PlayerProfile)
    private readonly playerRepo: Repository<PlayerProfile>,
  ) {}

  async getWallet(userId: string) {
    const player = await this._getPlayer(userId);
    const wallet = await this.walletRepo.findOne({ where: { player_id: player.id } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async getShopItems() {
    return this.itemRepo.find();
  }

  async getRecipes() {
    return this.recipeRepo.find();
  }

  async getRecipeById(id: string) {
    const recipe = await this.recipeRepo.findOne({ where: { id } });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async buyItem(userId: string, dto: BuyItemDto) {
    const player = await this._getPlayer(userId);
    const item = await this.itemRepo.findOne({ where: { id: dto.item_id } });
    if (!item) throw new NotFoundException('Item not found');

    const totalCost = item.price * dto.quantity;
    const wallet = await this.walletRepo.findOne({ where: { player_id: player.id } });
    if (!wallet || wallet.money < totalCost) {
      throw new BadRequestException(`Insufficient funds. Need ${totalCost} coins`);
    }

    wallet.money -= totalCost;
    await this.walletRepo.save(wallet);

    let inventory = await this.inventoryRepo.findOne({
      where: { player_id: player.id, item_id: item.id },
    });
    if (inventory) {
      inventory.quantity += dto.quantity;
    } else {
      inventory = this.inventoryRepo.create({
        player_id: player.id,
        item_id: item.id,
        quantity: dto.quantity,
      });
    }
    await this.inventoryRepo.save(inventory);

    return wallet;
  }

  async getInventory(userId: string) {
    const player = await this._getPlayer(userId);
    const entries = await this.inventoryRepo.find({ where: { player_id: player.id } });
    return Promise.all(
      entries.map(async (entry) => {
        const item = await this.itemRepo.findOne({ where: { id: entry.item_id } });
        return { item, quantity: entry.quantity };
      }),
    );
  }

  // Used internally by other services
  async addMoneyByPlayerId(playerId: string, amount: number) {
    const wallet = await this.walletRepo.findOne({ where: { player_id: playerId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    wallet.money += amount;
    return this.walletRepo.save(wallet);
  }

  private async _getPlayer(userId: string) {
    const player = await this.playerRepo.findOne({ where: { user_id: userId } });
    if (!player) throw new NotFoundException('Player profile not found');
    return player;
  }
}

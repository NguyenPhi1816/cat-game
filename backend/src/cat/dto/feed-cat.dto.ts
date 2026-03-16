import { IsString } from 'class-validator';

export class FeedCatDto {
  @IsString()
  item_id: string; // food item from inventory
}

import { IsInt, IsString, Min } from 'class-validator';

export class BuyItemDto {
  @IsString()
  item_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

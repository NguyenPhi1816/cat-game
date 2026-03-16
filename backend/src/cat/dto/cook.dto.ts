import { IsString } from 'class-validator';

export class CookDto {
  @IsString()
  recipe_id: string;
}

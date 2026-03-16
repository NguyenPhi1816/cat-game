import { IsOptional, IsString } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  player_name?: string;
}

import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCatDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  personality_type?: string; // chef, lazy, clean_freak, playful
}

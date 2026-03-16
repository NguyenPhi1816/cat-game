import { IsString } from 'class-validator';

export class AssignJobDto {
  @IsString()
  cat_id: string;

  @IsString()
  job_id: string;
}

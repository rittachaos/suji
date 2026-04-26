import { IsString, MinLength } from 'class-validator';

export class CreateCoachApplicationDto {
  @IsString()
  @MinLength(10)
  reason!: string;
}

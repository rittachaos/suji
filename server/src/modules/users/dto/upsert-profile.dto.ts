import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Gender, TrainingPhase } from '@prisma/client';

export class UpsertProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsEnum(TrainingPhase)
  trainingPhase?: TrainingPhase;

  @IsOptional()
  @IsString()
  note?: string;
}

import { GoalType } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertGoalDto {
  @IsEnum(GoalType)
  goalType!: GoalType;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @IsNumber()
  targetBodyFat?: number;

  @IsOptional()
  @IsNumber()
  targetWaistCm?: number;

  @IsOptional()
  @IsObject()
  targetStrength?: Record<string, number>;

  @IsOptional()
  @IsInt()
  targetCycleDays?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

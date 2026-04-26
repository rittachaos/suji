import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateBodyRecordDto {
  @IsString()
  recordDate!: string;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  bodyFatRate?: number;

  @IsOptional()
  @IsNumber()
  skeletalMuscle?: number;

  @IsOptional()
  @IsNumber()
  chestCm?: number;

  @IsOptional()
  @IsNumber()
  waistCm?: number;

  @IsOptional()
  @IsNumber()
  hipCm?: number;

  @IsOptional()
  @IsNumber()
  armCm?: number;

  @IsOptional()
  @IsNumber()
  thighCm?: number;

  @IsOptional()
  @IsNumber()
  calfCm?: number;

  @IsOptional()
  @IsNumber()
  shoulderCm?: number;

  @IsOptional()
  @IsObject()
  extraMetrics?: Record<string, number>;

  @IsOptional()
  @IsString()
  note?: string;
}

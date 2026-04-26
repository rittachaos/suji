import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ExerciseSetDto {
  @IsInt()
  setIndex!: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsInt()
  reps?: number;

  @IsOptional()
  @IsNumber()
  rpe?: number;

  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  distanceMeters?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

class TrainingExerciseDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  equipment?: string;

  @IsOptional()
  @IsString()
  bodyPart?: string;

  @IsOptional()
  @IsIn(['STRENGTH', 'CARDIO'])
  exerciseType?: 'STRENGTH' | 'CARDIO';

  @IsOptional()
  @IsNumber()
  workingWeightKg?: number;

  @IsOptional()
  @IsNumber()
  topWeightKg?: number;

  @IsOptional()
  @IsInt()
  setCount?: number;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseSetDto)
  sets!: ExerciseSetDto[];
}

export class CreateTrainingSessionDto {
  @IsString()
  sessionDate!: string;

  @IsString()
  bodyPart!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingExerciseDto)
  exercises!: TrainingExerciseDto[];
}

export { ExerciseSetDto, TrainingExerciseDto };

import { IsOptional, IsString } from 'class-validator';

export class CreateStudentRelationDto {
  @IsString()
  coachId!: string;

  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

import { IsString, Length } from 'class-validator';

export class BindPhoneDto {
  @IsString()
  @Length(11, 11)
  phone!: string;
}

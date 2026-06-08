import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PhoneAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}
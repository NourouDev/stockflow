import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  reorderPoint?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
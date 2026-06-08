import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  reorderPoint?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
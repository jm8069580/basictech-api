import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProductUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  comparePrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La categoria es requerida' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La marca es requerida' })
  brandId?: string;
}

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

export class ProductCreateDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

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

  @IsString()
  @IsNotEmpty({ message: 'La categoria es requerida' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'La marca es requerida' })
  brandId: string;
}

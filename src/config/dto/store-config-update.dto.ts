import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StoreConfigUpdateDto {
  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shippingCountries?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxRate?: number;
}

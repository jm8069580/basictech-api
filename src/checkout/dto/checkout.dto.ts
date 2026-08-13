import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CheckoutDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'No items in cart' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  shippingAddressId?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryCreateDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  slug: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

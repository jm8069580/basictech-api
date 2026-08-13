import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty({ message: 'El rotulo es requerido' })
  label: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'La direccion es requerida' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'El departamento es requerido' })
  state: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

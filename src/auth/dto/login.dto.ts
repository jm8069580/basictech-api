import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalido' })
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contrasena es requerida' })
  password: string;
}

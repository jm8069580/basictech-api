import { IsIn, IsOptional } from 'class-validator';

export class UsersQueryDto {
  @IsOptional()
  @IsIn(['customer', 'admin', 'moderator'])
  role?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;
}

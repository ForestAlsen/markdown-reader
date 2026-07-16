import { IsString, IsOptional, MinLength } from 'class-validator';
import { RegisterDto } from '@md-reader/shared';

export class RegisterDtoImpl implements RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  email?: string;
}

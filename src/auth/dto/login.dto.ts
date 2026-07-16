import { IsString, MinLength } from 'class-validator';
import { LoginDto } from '@md-reader/shared';

export class LoginDtoImpl implements LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

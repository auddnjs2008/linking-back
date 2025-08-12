import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { LoginType } from '../entity/user.entity';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password?: string;

  @IsEnum(LoginType)
  @IsOptional()
  @ApiProperty()
  loginType: LoginType;

  @IsString()
  @IsOptional()
  @ApiProperty()
  profile?: string;
}

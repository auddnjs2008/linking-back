import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @ApiProperty({
    description: '사용자 이름',
    example: '김명원',
  })
  name: string;
}

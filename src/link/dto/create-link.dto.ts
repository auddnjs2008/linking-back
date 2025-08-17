import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  @ApiProperty({ example: '타이틀' })
  title: string;

  @IsString()
  @ApiProperty({ example: '나는 설명이다.' })
  description: string;

  @IsUrl()
  @ApiProperty({ example: 'https://www.naver.com' })
  linkUrl: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ example: ['lala', 'lala2'] })
  tags?: string[];
}

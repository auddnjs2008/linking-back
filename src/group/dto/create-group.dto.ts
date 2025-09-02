import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @ApiProperty({ example: 'group1' })
  title: string;

  @IsString()
  @ApiProperty({ example: '나는 그룹이다.' })
  description: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [1, 2] })
  linkIds: number[];
}

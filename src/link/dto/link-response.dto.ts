import { ApiProperty } from '@nestjs/swagger';

export class LinkResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'NestJS 공식 문서' })
  title: string;

  @ApiProperty({ example: 'https://nestjs.com/' })
  linkUrl: string;

  @ApiProperty({ example: 'https://nestjs.com/' })
  thumbnail: string;

  @ApiProperty({ example: 'NestJS 프레임워크 공식 문서입니다.' })
  description: string;

  @ApiProperty({ example: 1 })
  creatorId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class LinkWithBookmarksResponseDto extends LinkResponseDto {
  @ApiProperty({ example: 3 })
  bookmarkCount: number;

  @ApiProperty({ example: true })
  isBookmarked: boolean;
}

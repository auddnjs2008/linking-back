import { ApiProperty } from '@nestjs/swagger';

export class GroupResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '프로그래밍 스터디' })
  name: string;

  @ApiProperty({ example: '프로그래밍을 함께 공부하는 그룹입니다.' })
  description: string;

  @ApiProperty({ example: 1 })
  creatorId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class GroupWithBookmarksResponseDto extends GroupResponseDto {
  @ApiProperty({ example: 5 })
  bookmarkCount: number;

  @ApiProperty({ example: true })
  isBookmarked: boolean;
}

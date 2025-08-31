import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

export class GroupResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '프로그래밍 스터디' })
  title: string;

  @ApiProperty({ example: '프로그래밍을 함께 공부하는 그룹입니다.' })
  description: string;

  @ApiProperty({ type: UserResponseDto })
  author: UserResponseDto;

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

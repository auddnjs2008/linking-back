import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty({ description: '총 링크 수', example: 1247 })
  totalLinks: number;

  @ApiProperty({ description: '총 그룹 수', example: 89 })
  totalGroups: number;

  @ApiProperty({ description: '총 사용자 수', example: 234 })
  totalUsers: number;

  @ApiProperty({ description: '오늘 추가된 링크 수', example: 23 })
  addedToday: number;
}

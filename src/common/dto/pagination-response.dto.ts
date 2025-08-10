import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class CursorPaginationResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ example: 'eyJpZCI6MTB9' })
  nextCursor?: string;

  @ApiProperty({ example: 'eyJpZCI6MX0=' })
  prevCursor?: string;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

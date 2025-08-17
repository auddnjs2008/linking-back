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
  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description: '페이지네이션된 데이터 배열',
  })
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

// 링크용 커서 페이지네이션 응답 (구체적인 타입)
export class LinkCursorPaginationResponseDto extends CursorPaginationResponseDto<any> {
  @ApiProperty({
    type: 'array',
    items: { $ref: '#/components/schemas/LinkResponseDto' },
    description: '링크 데이터 배열',
  })
  data: any[];
}

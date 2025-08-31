import { ApiProperty } from '@nestjs/swagger';
import { GroupResponseDto } from 'src/group/dto/group-response.dto';
import { LinkResponseDto } from 'src/link/dto/link-response.dto';

export class CursorPaginationMetaDto {
  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: 15, nullable: true })
  nextCursor?: number;

  @ApiProperty({ example: 'ASC' })
  order: string;

  @ApiProperty({ example: 10 })
  take: number;

  @ApiProperty({ example: 5, nullable: true })
  currentCursor?: number;
}

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

  @ApiProperty({ type: CursorPaginationMetaDto })
  meta: CursorPaginationMetaDto;
}

// 링크용 커서 페이지네이션 응답 (구체적인 타입)
export class LinkCursorPaginationResponseDto extends CursorPaginationResponseDto<LinkResponseDto> {
  @ApiProperty({
    type: 'array',
    items: { $ref: '#/components/schemas/LinkResponseDto' },
    description: '링크 데이터 배열',
  })
  data: LinkResponseDto[];
}

export class GroupCursorPaginationResponseDto extends CursorPaginationResponseDto<GroupResponseDto> {
  @ApiProperty({
    type: 'array',
    items: { $ref: '#/components/schemas/GroupResponseDto' },
    description: '그룹 데이터 배열',
  })
  data: GroupResponseDto[];
}

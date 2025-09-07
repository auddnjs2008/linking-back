import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPagePaginationDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @IsOptional()
  take: number = 10;

  @IsString()
  @IsOptional()
  keyword?: string;
}

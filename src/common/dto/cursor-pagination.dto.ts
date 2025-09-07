import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsOptional()
  @IsDateString()
  startDate?: string; // YYYY-MM-DD 형식

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isBookmarked?: boolean;

  @IsOptional()
  @IsBoolean()
  hasThumbnail?: boolean;
}

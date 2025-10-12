import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CursorPagePaginationDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => +value)
  id?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => +value)
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
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isBookmarked?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  hasThumbnail?: boolean;

  @IsOptional()
  @IsString()
  tagKeyword?: string;
}

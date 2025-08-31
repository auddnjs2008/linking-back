import { IsString } from 'class-validator';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';

export class SearchLinkDto extends CursorPagePaginationDto {
  @IsString()
  keyword: string;
}

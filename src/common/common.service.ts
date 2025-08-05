import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import PagePaginationDto from './dto/page-pagination.dto';
import { CursorPagePaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePagination<T>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
    const { page, take } = dto;
    const skip = (page - 1) * take;
    qb.skip(skip);
    qb.take(take);
  }

  applyCursorPagination<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPagePaginationDto,
  ) {
    const { id, order, take } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>' : '<';

      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }

    qb.orderBy(`${qb.alias}.id`, order);
    qb.take(take);
  }
}

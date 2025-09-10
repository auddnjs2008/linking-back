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
    const { id, order } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>' : '<';

      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }

    qb.orderBy(`${qb.alias}.id`, order);
    // qb.take(take);
  }

  applyLinkFilters<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPagePaginationDto,
    currentUserId?: number,
  ) {
    if (dto.keyword?.trim()) {
      qb.andWhere('link.title ILIKE :keyword', {
        keyword: `%${dto.keyword.trim()}%`,
      });
    }

    if (dto.startDate) {
      qb.andWhere('link.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      qb.andWhere('link.createdAt <= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    if (dto.isBookmarked !== undefined && currentUserId) {
      if (dto.isBookmarked) {
        console.log('bookmark ture', dto.isBookmarked);
        qb.andWhere(
          'EXISTS (SELECT 1 FROM link_user_bookmark lub WHERE lub."linkId" = link.id AND lub."userId" = :currentUserId AND lub."isBookmarked" = true)',
        );
      } else {
        qb.andWhere(
          'NOT EXISTS (SELECT 1 FROM link_user_bookmark lub WHERE lub."linkId" = link.id AND lub."userId" = :currentUserId AND lub."isBookmarked" = true)',
        );
      }
      qb.setParameter('currentUserId', currentUserId);
    }

    if (dto.hasThumbnail !== undefined) {
      if (dto.hasThumbnail) {
        qb.andWhere("link.thumbnail IS NOT NULL AND link.thumbnail != ''");
      } else {
        qb.andWhere("link.thumbnail IS NULL OR link.thumbnail = ''");
      }
    }
  }

  applyGroupFilters<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPagePaginationDto,
    currentUserId: number,
  ) {
    if (dto.keyword?.trim()) {
      qb.andWhere('group.title ILIKE :keyword', {
        keyword: `%${dto.keyword.trim()}%`,
      });
    }

    if (dto.startDate) {
      qb.andWhere('group.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      qb.andWhere('group.createdAt >= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    if (dto.isBookmarked !== undefined && currentUserId) {
      if (dto.isBookmarked) {
        qb.andWhere(
          `EXISTS (SELECT 1 FROM group_user_bookmark gub WHERE gub."groupId" = group.id AND gub."userId" = :currentUserId AND gub."isBookmarked" = true)`,
        );
      } else {
        qb.andWhere(
          `NOT EXISTS (SELECT 1 FROM group_user_bookmark gub WHERE gub."groupId" = group.id AND gub."userId" = :currentUserId AND gub."isBookmarked" = true)`,
        );
      }
      qb.setParameter('currentUserId', currentUserId);
    }
  }
}

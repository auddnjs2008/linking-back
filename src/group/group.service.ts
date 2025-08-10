import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { Repository } from 'typeorm';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CommonService } from 'src/common/common.service';
import User from 'src/user/entity/user.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
  ) {}

  async findAll() {
    return this.groupRepository.find({});
  }

  async findByCursorPagination(dto: CursorPagePaginationDto, userId: number) {
    const qb = this.groupRepository.createQueryBuilder('group');
    qb.leftJoinAndSelect('group.user', 'user');
    qb.leftJoinAndSelect('group.linkedLinks', 'linkedLinks');
    qb.leftJoinAndSelect('group.bookmarkedUsers', 'bookmarkedUsers');
    this.commonService.applyCursorPagination(qb, dto);

    qb.take(dto.take + 1);

    const curUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!curUser) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const groups = await qb.getMany();

    const hasNextPage = groups.length > dto.take;
    const data = hasNextPage ? groups.slice(0, dto.take) : groups;

    const filteredData = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      linkedLinksCount: item.linkedLinks.length,
      author: item.user,
      createdAt: item.createdAt,
      isBookmarked: item.bookmarkedUsers.some(
        (bookmark) => bookmark.user.id === curUser.id && bookmark.isBookmarked,
      ),
    }));

    return {
      data: filteredData,
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? data[data.length - 1].id : null,
        order: dto.order,
        take: dto.take,
        currentCursor: dto.id || null,
      },
    };
  }
}

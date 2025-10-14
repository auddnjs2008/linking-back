import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { Repository, In } from 'typeorm';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CommonService } from 'src/common/common.service';
import User from 'src/user/entity/user.entity';
import { BadRequestException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { Link } from 'src/link/entity/link.entity';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupUserBookmark } from './entity/group-user-bookmark.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    @InjectRepository(GroupUserBookmark)
    private readonly groupUserBookmarkRepository: Repository<GroupUserBookmark>,
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

    qb.addSelect(
      `(SELECT gub."isBookmarked" FROM group_user_bookmark gub
        WHERE gub."groupId" = group.id AND gub."userId" = :currentUserId
      )`,
      'isBookmarked',
    );

    qb.setParameter('currentUserId', userId);

    this.commonService.applyCursorPagination(qb, dto);
    this.commonService.applyGroupFilters(qb, dto, userId);

    const curUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!curUser) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    qb.take(dto.take + 1);
    const rawResults = await qb.getRawAndEntities();

    //엔티티와 raw 데이터를 매핑하여 isBookmarked 포함
    const groupsWithBookmark = rawResults.entities.map((group) => {
      const rawData = rawResults.raw.find((raw) => raw.group_id === group.id);
      return {
        ...group,
        isBookmarked: rawData?.isBookmarked || false,
      };
    });

    const hasNextPage = groupsWithBookmark.length > dto.take;
    const data = hasNextPage
      ? groupsWithBookmark.slice(0, dto.take)
      : groupsWithBookmark;

    const filteredData = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      linkedLinks: item.linkedLinks.map((item) => ({
        id: item.id,
        title: item.title,
      })),
      author: item.user,
      createdAt: item.createdAt,
      isBookmarked: item.isBookmarked,
      bookmarkCount: item.bookmarkedUsers.length,
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

  async findByUserCursorPagination(
    dto: CursorPagePaginationDto,
    userId: number,
    currentUser: { sub: number },
  ) {
    if (!userId || !currentUser?.sub) {
      throw new BadRequestException('유효하지 않은 사용자 정보입니다.');
    }

    const qb = this.groupRepository.createQueryBuilder('group');

    qb.leftJoinAndSelect('group.user', 'user');
    qb.leftJoinAndSelect('group.linkedLinks', 'linkedLinks');

    qb.addSelect(
      `
      (
        SELECT gub."isBookmarked" FROM group_user_bookmark gub
        WHERE gub."groupId" = group.id AND gub."userId" = :currentUserId
      )`,
      'isBookmarked',
    );
    qb.setParameter('currentUserId', currentUser.sub);

    this.commonService.applyCursorPagination(qb, dto);
    this.commonService.applyGroupFilters(qb, dto, currentUser.sub);

    qb.andWhere('user.id = :userId', { userId });
    qb.take(dto.take + 1);

    const rawResults = await qb.getRawAndEntities();

    const groupWithBookmark = rawResults.entities.map((group) => {
      const rawData = rawResults.raw.find((raw) => raw.group_id === group.id);
      return {
        ...group,
        isBookmarked: rawData?.isBookmarked || false,
      };
    });

    const hasNextPage = groupWithBookmark.length > dto.take;
    const data = hasNextPage
      ? groupWithBookmark.slice(0, dto.take)
      : groupWithBookmark;

    const filteredData = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      author: item.user,
      createdAt: item.createdAt,
      linkedLinks: item.linkedLinks?.map((link) => ({
        id: link.id,
        title: link.title,
      })),
      isBookmarked: item.isBookmarked,
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

  async findItem(groupId: number, currentUserId: number) {
    const qb = this.groupRepository.createQueryBuilder('group');
    qb.leftJoinAndSelect('group.user', 'user')
      .leftJoinAndSelect('group.linkedLinks', 'linkedLinks')
      .leftJoinAndSelect('linkedLinks.user', 'linkedLinksUser')
      .leftJoinAndSelect('linkedLinks.tags', 'linkedLinksTags')
      .leftJoinAndSelect('group.bookmarkedUsers', 'bookmarkedUsers')
      .leftJoinAndSelect('bookmarkedUsers.user', 'bookmarkedUsersUser')
      .where('group.id = :groupId', { groupId });

    qb.addSelect(
      `
      (
        SELECT gub."isBookmarked" FROM group_user_bookmark gub
        WHERE gub."groupId" = group.id AND gub."userId"=:currentUserId
      )`,
      'groupIsBookmarked',
    );
    qb.setParameter('currentUserId', currentUserId);

    qb.addSelect(
      `
      (
        SELECT lub."isBookmarked" FROM link_user_bookmark lub
        WHERE lub."linkId" = linkedLinks.id AND lub."userId" = :currentUserId
      )
      `,
      'linkIsBookmarked',
    );

    const rawResults = await qb.getRawAndEntities();

    await this.groupRepository.increment({ id: groupId }, 'views', 1);

    if (!rawResults.entities[0]) {
      throw new BadRequestException('해당 그룹을 찾을 수 없습니다.');
    }

    const group = rawResults.entities[0];
    const rawData = rawResults.raw[0];

    group.isBookmarked = rawData.groupIsBookmarked || false;

    group.linkedLinks = group.linkedLinks.map((link, index) => ({
      ...link,
      isBookmarked: rawResults.raw[index]?.linkIsBookmarked || false,
      tags: link.tags?.map((tag) => tag.name) || [],
    })) as any;

    return group;
  }

  async create(dto: CreateGroupDto, userId: number) {
    const { title, description, linkIds } = dto;

    // 사용자 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 링크들이 존재하는지 확인하고 가져오기
    let links = [];
    if (linkIds && linkIds.length > 0) {
      links = await this.linkRepository.findBy({
        id: In(linkIds),
      });

      if (links.length !== linkIds.length) {
        throw new BadRequestException('일부 링크를 찾을 수 없습니다.');
      }
    }

    // 그룹 생성
    const newGroup = this.groupRepository.create({
      title,
      description,
      user,
      linkedLinks: links,
    });

    // 그룹 저장
    const savedGroup = await this.groupRepository.save(newGroup);

    return savedGroup;
  }

  async update(dto: UpdateGroupDto, groupId: number) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new BadRequestException('해당하는 그룹이 없습니다.');
    }

    // 링크 관계 업데이트
    if (dto.linkIds !== undefined) {
      let newLinks = [];
      if (dto.linkIds && dto.linkIds.length > 0) {
        newLinks = await this.linkRepository.findBy({
          id: In(dto.linkIds),
        });

        if (newLinks.length !== dto.linkIds.length) {
          throw new BadRequestException('일부 링크를 찾을 수 없습니다.');
        }
      }

      // 링크 관계 업데이트
      group.linkedLinks = newLinks;
    }

    // 기본 필드 업데이트
    if (dto.title !== undefined) group.title = dto.title;
    if (dto.description !== undefined) group.description = dto.description;

    // 그룹 저장
    const updatedGroup = await this.groupRepository.save(group);
    return updatedGroup;
  }

  async delete(id: number) {
    const group = await this.groupRepository.findOne({ where: { id } });

    if (!group) {
      throw new BadRequestException('일치하는 그룹이 없습니다.');
    }

    await this.groupRepository.delete(id);
    return id;
  }

  async getbookmarkRecord(groupId: number, userId: number) {
    return this.groupUserBookmarkRepository
      .createQueryBuilder('gur')
      .leftJoinAndSelect('gur.group', 'group')
      .leftJoinAndSelect('gur.user', 'user')
      .where('group.id = :groupId', { groupId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async toggleBookmark(groupId: number, userId: number, isBookmarked: boolean) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new BadRequestException('일치하는 그룹이 없습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('일치하는 유저가 없습니다.');
    }

    const groupUserRecord = await this.getbookmarkRecord(groupId, userId);

    if (groupUserRecord) {
      await this.groupUserBookmarkRepository.update(
        { group, user },
        { isBookmarked },
      );
    } else {
      await this.groupUserBookmarkRepository.save({
        group,
        user,
        isBookmarked,
      });
    }
  }
}

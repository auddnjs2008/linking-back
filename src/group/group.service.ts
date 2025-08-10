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

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
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
}

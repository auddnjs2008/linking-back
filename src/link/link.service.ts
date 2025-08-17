import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entity/link.entity';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import User from 'src/user/entity/user.entity';
import { UpdateLinkDto } from './dto/update-link.dto';
import PagePaginationDto from 'src/common/dto/page-pagination.dto';
import { CommonService } from 'src/common/common.service';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { LinkUserBookmark } from './entity/link-user-bookmark.entity';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LinkUserBookmark)
    private readonly linkUserBookMarkRepository: Repository<LinkUserBookmark>,
    private readonly commonService: CommonService,
  ) {}

  async findAll() {
    // return this.linkRepository.find({ relations: ['user'] });
    const qb = this.linkRepository.createQueryBuilder();
    return qb.leftJoinAndSelect('link.user', 'user').getMany();
  }

  async findByPagination(pagePaginationDto: PagePaginationDto) {
    const { page, take } = pagePaginationDto;

    const qb = this.linkRepository.createQueryBuilder('link');
    qb.leftJoinAndSelect('link.user', 'user');

    this.commonService.applyPagePagination(qb, pagePaginationDto);

    const [links, total] = await qb.getManyAndCount();

    return {
      data: links,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
        hasNextPage: page < Math.ceil(total / take),
        hasPrevPage: page > 1,
      },
    };
  }

  async findByCursorPagination(dto: CursorPagePaginationDto, userId: number) {
    const qb = this.linkRepository.createQueryBuilder('link');
    qb.leftJoinAndSelect('link.user', 'user');

    // 북마크 여부를 서브쿼리로 체크 (성능 향상)
    qb.addSelect(
      `EXISTS(
      SELECT 1 FROM link_user_bookmark lub 
      WHERE lub."linkId" = link.id 
      AND lub."userId" = :currentUserId 
      AND lub."isBookmarked" = true
    )`,
      'isBookmarked',
    );
    qb.setParameter('currentUserId', userId);

    this.commonService.applyCursorPagination(qb, dto);

    const curUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!curUser) {
      throw new BadRequestException('현재 유저는 존재하지 않습니다.');
    }

    // 다음 페이지 확인을 위해 1개 더 가져옴
    qb.take(dto.take + 1);
    const links = await qb.getMany();

    // 다음 페이지 존재 여부 확인
    const hasNextPage = links.length > dto.take;
    const data = hasNextPage ? links.slice(0, dto.take) : links;
    const filteredData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      author: item.user,
      isBookmarked: item.isBookmarked || false,
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
    // 입력값 검증
    if (!userId || !currentUser?.sub) {
      throw new BadRequestException('유효하지 않은 사용자 정보입니다.');
    }

    const qb = this.linkRepository.createQueryBuilder('link');

    // 기본 JOIN
    qb.leftJoinAndSelect('link.user', 'user');

    // 북마크 여부를 서브쿼리로 체크 (성능 향상)
    qb.addSelect(
      `EXISTS(
        SELECT 1 FROM link_user_bookmark lub 
        WHERE lub."linkId" = link.id 
        AND lub."userId" = :currentUserId 
        AND lub."isBookmarked" = true
      )`,
      'isBookmarked',
    );

    qb.setParameter('currentUserId', currentUser.sub);

    // 커서 페이지네이션 적용
    this.commonService.applyCursorPagination(qb, dto);

    // 특정 사용자의 링크만 조회
    qb.where('user.id = :userId', { userId });

    qb.take(dto.take + 1);
    const links = await qb.getMany();

    // 다음 페이지 존재 여부 확인
    const hasNextPage = links.length > dto.take;
    const data = hasNextPage ? links.slice(0, dto.take) : links;

    // 데이터 변환
    const filteredData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      author: item.user,
      isBookmarked: item.isBookmarked || false,
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

  async findOne(id: number) {
    return this.linkRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(createLinkDto: CreateLinkDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('아이디에 맞는 사용자가 없습니다.');
    }

    // create()로 엔티티 인스턴스 생성
    const newLink = this.linkRepository.create({
      ...createLinkDto,
      user,
    });

    // save()로 데이터베이스에 저장
    return this.linkRepository.save(newLink);
  }

  async update(updateLinkDto: UpdateLinkDto, id: number) {
    const link = await this.linkRepository.findOne({ where: { id } });
    if (!link) {
      throw new BadRequestException('일치하는 링크 아이디가 없습니다.');
    }

    await this.linkRepository.update({ id }, updateLinkDto);

    const newLink = await this.linkRepository.findOne({ where: { id } });
    return newLink;
  }

  async delete(id: number) {
    const link = await this.linkRepository.findOne({ where: { id } });
    if (!link) {
      throw new BadRequestException('일치하는 링크가 없습니다.');
    }

    await this.linkRepository.delete(id);
    return id;
  }

  async getbookmarkRecord(linkId: number, userId: number) {
    return this.linkUserBookMarkRepository
      .createQueryBuilder('lbm')
      .leftJoinAndSelect('lbm.link', 'link')
      .leftJoinAndSelect('lbm.user', 'user')
      .where('link.id = :linkId', { linkId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async toggleBookmark(linkId: number, userId: number, isBookmarked: boolean) {
    const link = await this.linkRepository.findOne({ where: { id: linkId } });

    if (!link) {
      throw new BadRequestException('일치하는 링크가 없습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('일치하는 유저가 없습니다.');
    }

    const linkUserRecord = await this.getbookmarkRecord(linkId, userId);

    if (linkUserRecord) {
      await this.linkUserBookMarkRepository.update(
        { link, user },
        { isBookmarked },
      );
    } else {
      await this.linkUserBookMarkRepository.save({
        link,
        user,
        isBookmarked,
      });
    }

    const result = await this.getbookmarkRecord(linkId, userId);

    return {
      isBookmarked: result.isBookmarked,
    };
  }
}

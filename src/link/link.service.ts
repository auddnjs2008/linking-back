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
import { TagService } from 'src/tag/tag.service';

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
    private readonly tagService: TagService,
  ) {}

  async findAll() {
    // return this.linkRepository.find({ relations: ['user', 'tags'] });
    const qb = this.linkRepository.createQueryBuilder('link');
    const links = await qb
      .leftJoinAndSelect('link.user', 'user')
      .leftJoinAndSelect('link.tags', 'tags')
      .getMany();

    // 프론트엔드에 tags를 string[]로 반환
    return links.map((link) => ({
      ...link,
      tags: link.tags ? link.tags.map((tag) => tag.name) : [],
    }));
  }

  async findByPagination(pagePaginationDto: PagePaginationDto) {
    const { page, take } = pagePaginationDto;

    const qb = this.linkRepository.createQueryBuilder('link');
    qb.leftJoinAndSelect('link.user', 'user');
    qb.leftJoinAndSelect('link.tags', 'tags');

    this.commonService.applyPagePagination(qb, pagePaginationDto);

    const [links, total] = await qb.getManyAndCount();

    // 프론트엔드에 tags를 string[]로 반환
    const formattedLinks = links.map((link) => ({
      ...link,
      tags: link.tags ? link.tags.map((tag) => tag.name) : [],
    }));

    return {
      data: formattedLinks,
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
    qb.leftJoinAndSelect('link.tags', 'tags');

    // 북마크 여부를 서브쿼리로 체크 (성능 향상)
    qb.addSelect(
      `(SELECT lub."isBookmarked" FROM link_user_bookmark lub 
        WHERE lub."linkId" = link.id AND lub."userId" = :currentUserId)`,
      'isBookmarked',
    );
    qb.setParameter('currentUserId', userId);

    this.commonService.applyCursorPagination(qb, dto);

    this.commonService.applyLinkFilters(qb, dto, userId);

    const curUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!curUser) {
      throw new BadRequestException('현재 유저는 존재하지 않습니다.');
    }

    // 다음 페이지 확인을 위해 1개 더 가져옴
    qb.take(dto.take + 1);
    const rawResults = await qb.getRawAndEntities();

    // 엔티티와 raw 데이터를 매핑하여 isBookmarked 포함
    const linksWithBookmark = rawResults.entities.map((link) => {
      const rawData = rawResults.raw.find((raw) => raw.link_id === link.id);
      return {
        ...link,
        isBookmarked: rawData?.isBookmarked || false,
      };
    });

    // 다음 페이지 존재 여부 확인
    const hasNextPage = linksWithBookmark.length > dto.take;
    const data = hasNextPage
      ? linksWithBookmark.slice(0, dto.take)
      : linksWithBookmark;
    const filteredData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      linkUrl: item.linkUrl,
      thumbnail: item.thumbnail,
      author: item.user,
      tags: item.tags ? item.tags.map((tag) => tag.name) : [],
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
    qb.leftJoinAndSelect('link.tags', 'tags');

    // 북마크 여부를 서브쿼리로 체크 (성능 향상)
    qb.addSelect(
      `(
        SELECT lub."isBookmarked" FROM link_user_bookmark lub
        WHERE lub."linkId" = link.id AND lub."userId" = :currentUserId
      )`,
      'isBookmarked',
    );

    qb.setParameter('currentUserId', currentUser.sub);

    // 커서 페이지네이션 적용
    this.commonService.applyCursorPagination(qb, dto);
    this.commonService.applyLinkFilters(qb, dto, currentUser.sub);

    // 특정 사용자의 링크만 조회
    qb.andWhere('user.id = :userId', { userId });

    qb.take(dto.take + 1);
    // const links = await qb.getMany();

    const rawResults = await qb.getRawAndEntities();

    const linksWithBookmark = rawResults.entities.map((link) => {
      const rawData = rawResults.raw.find((raw) => raw.link_id === link.id);
      return {
        ...link,
        isBookmarked: rawData?.isBookmarked || false,
      };
    });

    // 다음 페이지 존재 여부 확인
    const hasNextPage = linksWithBookmark.length > dto.take;
    const data = hasNextPage
      ? linksWithBookmark.slice(0, dto.take)
      : linksWithBookmark;

    // 데이터 변환
    const filteredData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      linkUrl: item.linkUrl,
      thumbnail: item.thumbnail,
      author: item.user,
      tags: item.tags ? item.tags.map((tag) => tag.name) : [],
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

  async findOne(id: number, userId: number) {
    // return this.linkRepository.findOne({
    //   where: { id },
    //   relations: ['user', 'tags'],
    // });
    const qb = this.linkRepository.createQueryBuilder('link');
    qb.leftJoinAndSelect('link.user', 'user');
    qb.leftJoinAndSelect('link.tags', 'tags');

    qb.addSelect(
      `(SELECT lub."isBookmarked" FROM link_user_bookmark lub 
        WHERE lub."linkId" = :linkId AND lub."userId" = :currentUserId
      )`,
      'isBookmarked',
    );

    qb.setParameter('currentUserId', userId);
    qb.setParameter('linkId', id);
    qb.where('link.id = :linkId', { linkId: id });

    // addSelect로 추가한 컬럼을 포함하여 raw 결과와 엔티티를 모두 가져오기
    const rawResults = await qb.getRawAndEntities();

    if (rawResults.entities.length === 0) {
      return null;
    }

    // 엔티티와 raw 데이터를 매핑하여 isBookmarked 포함
    const link = rawResults.entities[0];
    const detail_link = {
      ...link,
      tags: link.tags ? link.tags.map((tag) => tag.name) : [],
      isBookmarked: rawResults.raw[0]?.isBookmarked || false,
    };

    return detail_link;
  }

  async create(createLinkDto: CreateLinkDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('아이디에 맞는 사용자가 없습니다.');
    }

    //썸네일 추출 서비스 호출
    const thumbnail = await this.extractThumbnail(createLinkDto.linkUrl);

    // 태그 처리: 태그 이름 배열을 Tag 엔티티 배열로 변환
    // (findOrCreateTags 안에서 자동으로 usageCount 증가 처리됨)
    let tags = [];
    if (createLinkDto.tags && createLinkDto.tags.length > 0) {
      tags = await this.tagService.findOrCreateTags(createLinkDto.tags);
    }

    // create()로 엔티티 인스턴스 생성
    const newLink = this.linkRepository.create({
      title: createLinkDto.title,
      description: createLinkDto.description,
      linkUrl: createLinkDto.linkUrl,
      user,
      thumbnail,
      tags,
    });

    // save()로 데이터베이스에 저장 (ManyToMany 관계도 함께 저장됨)
    const savedLink = await this.linkRepository.save(newLink);

    // 프론트엔드에 tags를 string[]로 반환
    return {
      ...savedLink,
      tags: savedLink.tags ? savedLink.tags.map((tag) => tag.name) : [],
    };
  }

  private async extractThumbnail(url: string): Promise<string> {
    try {
      //OPEN Graph 메타데이터에서 /섬네일 추출
      const response = await fetch(url);
      const html = await response.text();

      //og:image 태그에서 썸네일  URL 추출
      const ogImageMatch = html.match(
        /<meta property="og:image" content="([^"]+)"/,
      );
      if (ogImageMatch) {
        return ogImageMatch[1];
      }

      // 기본 썸네일 반환
      return '';
    } catch {
      //에러 시 기본 썸네일 반환
      return '';
    }
  }

  async update(updateLinkDto: UpdateLinkDto, id: number) {
    const link = await this.linkRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!link) {
      throw new BadRequestException('일치하는 링크 아이디가 없습니다.');
    }

    const updateThumbnail =
      link.linkUrl !== updateLinkDto.linkUrl
        ? await this.extractThumbnail(updateLinkDto.linkUrl)
        : link.thumbnail;

    // 태그 업데이트 처리
    if (updateLinkDto.tags !== undefined) {
      // 기존 태그들의 ID 저장
      const oldTagIds = link.tags.map((tag) => tag.id);

      // 새로운 태그들 생성/조회 (autoIncrement: false로 설정)
      const newTags =
        updateLinkDto.tags.length > 0
          ? await this.tagService.findOrCreateTags(updateLinkDto.tags, false)
          : [];
      const newTagIds = newTags.map((tag) => tag.id);

      // 링크 업데이트 (태그 포함)
      link.title = updateLinkDto.title ?? link.title;
      link.description = updateLinkDto.description ?? link.description;
      link.linkUrl = updateLinkDto.linkUrl ?? link.linkUrl;
      link.thumbnail = updateThumbnail;
      link.tags = newTags;

      await this.linkRepository.save(link);

      // 기존 태그 중 더 이상 사용하지 않는 태그의 usageCount 감소
      const removedTagIds = oldTagIds.filter((id) => !newTagIds.includes(id));
      if (removedTagIds.length > 0) {
        await this.tagService.decrementUsageCount(removedTagIds);
      }

      // 새로 추가된 태그의 usageCount 증가
      const addedTagIds = newTagIds.filter((id) => !oldTagIds.includes(id));
      if (addedTagIds.length > 0) {
        await this.tagService.incrementUsageCount(addedTagIds);
      }
    } else {
      // 태그 업데이트가 없는 경우, 기본 필드만 업데이트
      await this.linkRepository.update(
        { id },
        {
          title: updateLinkDto.title,
          description: updateLinkDto.description,
          linkUrl: updateLinkDto.linkUrl,
          thumbnail: updateThumbnail,
        },
      );
    }

    const updatedLink = await this.linkRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    // 프론트엔드에 tags를 string[]로 반환
    return {
      ...updatedLink,
      tags: updatedLink.tags ? updatedLink.tags.map((tag) => tag.name) : [],
    };
  }

  async delete(id: number) {
    const link = await this.linkRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!link) {
      throw new BadRequestException('일치하는 링크가 없습니다.');
    }

    // 연결된 태그들의 usageCount 감소
    if (link.tags && link.tags.length > 0) {
      const tagIds = link.tags.map((tag) => tag.id);
      await this.tagService.decrementUsageCount(tagIds);
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

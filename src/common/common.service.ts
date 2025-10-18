import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import PagePaginationDto from './dto/page-pagination.dto';
import { CursorPagePaginationDto } from './dto/cursor-pagination.dto';
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as Uuid } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from 'src/link/entity/link.entity';
import { Group } from 'src/group/entity/group.entity';
import User from 'src/user/entity/user.entity';
import { StatsResponseDto } from './dto/stats-response.dto';

@Injectable()
export class CommonService {
  private s3: S3;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      region: configService.get<string>('AWS_REGION'),
    });
  }

  async saveMovieToPermanentStorage(fileName: string) {
    try {
      const bucketName = this.configService.get<string>('BUCKET_NAME');
      await this.s3.copyObject({
        Bucket: bucketName,
        CopySource: `${bucketName}/temp/${fileName}`,
        Key: `/profile/${fileName}`,
        ACL: 'public-read',
      });

      await this.s3.deleteObject({
        Bucket: bucketName,
        Key: `temp/${fileName}`,
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('s3 에러!');
    }
  }

  async createPresignedUrl(expiresIn = 300, fileType: string) {
    const params = {
      Bucket: this.configService.get<string>('BUCKET_NAME'),
      Key: `/temp/${Uuid()}.${fileType}`,
      ACL: ObjectCannedACL.public_read,
    };

    try {
      const url = await getSignedUrl(this.s3, new PutObjectCommand(params), {
        expiresIn,
      });
      return url;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('S3 Presigned Url 생성 실패');
    }
  }

  async uploadProfileImage(file: Express.Multer.File, userId: number) {
    const bucketName = this.configService.get<string>('BUCKET_NAME');
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `profile-${userId}-${Uuid()}.${fileExtension}`;
    const key = `profile/${fileName}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));
      const imageUrl = `https://${bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
      return { fileName, imageUrl };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('프로필 이미지 업로드 실패');
    }
  }

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

    if (dto.tagKeyword !== undefined) {
      qb.andWhere('tags.name = :tagKeyword', { tagKeyword: dto.tagKeyword });
    }

    if (dto.createdByMe === true) {
      qb.andWhere('user.id = :currentUserId', { currentUserId });
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
      qb.andWhere('group.createdAt <= :endDate', {
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

    if (dto.createdByMe === true) {
      qb.andWhere('user.id = :currentUserId', { currentUserId });
    }
  }

  /**
   * 전체 시스템 통계 조회
   */
  async getStats(): Promise<StatsResponseDto> {
    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 병렬로 모든 통계 조회
    const [totalLinks, totalGroups, totalUsers, addedToday] = await Promise.all(
      [
        this.linkRepository.count(),
        this.groupRepository.count(),
        this.userRepository.count(),
        this.linkRepository
          .createQueryBuilder('link')
          .where('link.createdAt >= :today', { today })
          .andWhere('link.createdAt < :tomorrow', { tomorrow })
          .getCount(),
      ],
    );

    return {
      totalLinks,
      totalGroups,
      totalUsers,
      addedToday,
    };
  }
}

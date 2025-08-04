import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entity/link.entity';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import User from 'src/user/entities/user.entity';
import { UpdateLinkDto } from './dto/update-link.dto';
import PagePaginationDto from 'src/common/dto/page-pagination.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}

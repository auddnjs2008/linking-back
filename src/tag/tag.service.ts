import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entity/tag.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 태그 이름 배열을 받아서 Tag 엔티티 배열로 변환
   * @param tagNames - 태그 이름 배열
   * @param autoIncrement - true면 자동으로 usageCount 증가, false면 증가하지 않음 (기본값: true)
   */
  async findOrCreateTags(
    tagNames: string[],
    autoIncrement: boolean = true,
  ): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    // 중복 제거
    const uniqueTagNames = [...new Set(tagNames)];

    // 기존 태그들 조회
    const existingTags = await this.tagRepository.find({
      where: { name: In(uniqueTagNames) },
    });

    const existingTagNames = existingTags.map((tag) => tag.name);
    const newTagNames = uniqueTagNames.filter(
      (name) => !existingTagNames.includes(name),
    );

    // 새로운 태그 생성
    const newTags: Tag[] = [];
    if (newTagNames.length > 0) {
      for (const name of newTagNames) {
        // autoIncrement가 true면 1로 시작, false면 0으로 시작
        const tag = this.tagRepository.create({
          name,
          usageCount: autoIncrement ? 1 : 0,
        });
        newTags.push(tag);
      }
      await this.tagRepository.save(newTags);
    }

    // 기존 태그들의 usageCount 증가 (autoIncrement가 true일 때만)
    if (autoIncrement && existingTags.length > 0) {
      await this.tagRepository.increment(
        { id: In(existingTags.map((tag) => tag.id)) },
        'usageCount',
        1,
      );
    }

    // 모든 태그 반환 (기존 + 새로 생성)
    return [...existingTags, ...newTags];
  }

  /**
   * 태그 사용 횟수 증가
   */
  async incrementUsageCount(tagIds: number[]): Promise<void> {
    if (!tagIds || tagIds.length === 0) {
      return;
    }

    await this.tagRepository.increment({ id: In(tagIds) }, 'usageCount', 1);
  }

  /**
   * 태그 사용 횟수 감소
   */
  async decrementUsageCount(tagIds: number[]): Promise<void> {
    if (!tagIds || tagIds.length === 0) {
      return;
    }

    await this.tagRepository.decrement({ id: In(tagIds) }, 'usageCount', 1);
  }

  /**
   * 사용되지 않는 태그 정리 (usageCount가 0인 태그 삭제)
   */
  async cleanupUnusedTags(): Promise<void> {
    await this.tagRepository.delete({ usageCount: 0 });
  }

  /**
   * 모든 태그 조회 (사용 횟수 내림차순)
   */
  async findAll(limit?: number): Promise<Tag[]> {
    const qb = this.tagRepository.createQueryBuilder('tag');
    qb.orderBy('tag.usageCount', 'DESC');
    qb.addOrderBy('tag.name', 'ASC');

    if (limit) {
      qb.take(limit);
    }

    return qb.getMany();
  }

  /**
   * 태그 이름으로 검색 (자동완성용)
   */
  async searchByName(query: string, limit: number = 10): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :query', { query: `%${query}%` })
      .orderBy('tag.usageCount', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * 인기 태그 조회 (usageCount 기준 상위 N개)
   */
  async findPopular(limit: number = 20): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.usageCount > 0')
      .orderBy('tag.usageCount', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * 특정 태그 ID로 조회
   */
  async findById(id: number): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { id } });
  }

  /**
   * 특정 태그 이름으로 조회
   */
  async findByName(name: string): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { name } });
  }
}

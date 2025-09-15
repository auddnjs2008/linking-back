import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LinkComment } from './entity/linkComment.entity';
import { Repository } from 'typeorm';
import { CreateLinkCommentDto } from './dto/create-link-comment.dto';
import { LinkService } from 'src/link/link.service';
import { UserService } from 'src/user/user.service';
import { UpdateLinkCommentDto } from './dto/update-link-comment.dto';

@Injectable()
export class LinkCommentService {
  constructor(
    @InjectRepository(LinkComment)
    private readonly linkCommentRepository: Repository<LinkComment>,
    private readonly linkService: LinkService,
    private readonly userService: UserService,
  ) {}

  async findCommentsByLinkId(linkId: number) {
    return this.linkCommentRepository.find({
      where: { link: { id: linkId }, parentComment: null },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'ASC' }, // 댓글을 시간순으로 정렬
    });
  }

  async createComment(
    linkId: number,
    userId: number,
    dto: CreateLinkCommentDto,
  ) {
    // 링크 존재 여부 확인
    const link = await this.linkService.findOne(linkId, userId);
    if (!link) {
      throw new NotFoundException('링크를 찾을 수 없습니다.');
    }

    // 사용자 존재 여부 확인
    await this.userService.findOne(userId);

    // 재댓글인 경우 부모 댓글 검증

    if (dto.parentCommentId) {
      const parentComment = await this.linkCommentRepository.findOne({
        where: {
          id: dto.parentCommentId,
          link: { id: linkId },
        },
        relations: ['parentComment'],
      });

      if (!parentComment) {
        throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
      }

      if (parentComment.parentComment) {
        throw new BadRequestException('재댓글에든ㄴ 답글을 달 수 없습니다.');
      }
    }

    // 댓글 생성
    const comment = this.linkCommentRepository.create({
      comment: dto.comment,
      link: { id: linkId },
      user: { id: userId },
      parentComment: dto.parentCommentId ? { id: dto.parentCommentId } : null,
    });

    return this.linkCommentRepository.save(comment);
  }

  async updateComment(
    commentId: number,
    userId: number,
    dto: UpdateLinkCommentDto,
  ) {
    const linkComment = await this.linkCommentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'replies'],
    });

    if (!linkComment) {
      throw new NotFoundException('링크 코멘트를 찾을 수 없습니다.');
    }

    if (linkComment.user.id !== userId) {
      throw new BadRequestException('댓글을 수정할 권한이 없습니다.');
    }

    await this.linkCommentRepository.update(
      { id: commentId, user: { id: userId } },
      { comment: dto.comment },
    );

    const newLinkComment = await this.linkCommentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'replies', 'replies.user'],
    });
    return newLinkComment;
  }

  async deleteComment(id: number) {
    const linkComment = await this.linkCommentRepository.findOne({
      where: { id },
      relations: ['user', 'replies'],
    });

    if (!linkComment) {
      throw new BadRequestException('일치하는 코멘트가 없습니다.');
    }

    await this.linkCommentRepository.delete(id);
    return id;
  }
}

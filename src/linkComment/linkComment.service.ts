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
      where: { link: { id: linkId } },
      relations: ['user', 'link'],
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

    // 댓글 생성
    const comment = this.linkCommentRepository.create({
      comment: dto.comment,
      link: { id: linkId },
      user: { id: userId },
    });

    return this.linkCommentRepository.save(comment);
  }

  async updateComment(
    commentId: number,
    userId: number,
    dto: UpdateLinkCommentDto,
  ) {
    const linkComment = this.linkCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!linkComment) {
      throw new NotFoundException('링크 코멘트를 찾을 수 없습니다.');
    }

    await this.linkCommentRepository.update(
      { id: commentId, user: { id: userId } },
      { comment: dto.comment },
    );

    const newLinkComment = await this.linkCommentRepository.findOne({
      where: { id: commentId },
    });
    return newLinkComment;
  }

  async deleteComment(id: number) {
    const linkComment = await this.linkCommentRepository.findOne({
      where: { id },
    });

    if (!linkComment) {
      throw new BadRequestException('일치하는 코멘트가 없습니다.');
    }

    await this.linkCommentRepository.delete(id);
    return id;
  }
}

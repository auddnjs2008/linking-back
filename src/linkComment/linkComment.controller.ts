import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LinkCommentService } from './linkComment.service';
import { CreateLinkCommentDto } from './dto/create-link-comment.dto';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { UpdateLinkCommentDto } from './dto/update-link-comment.dto';

@Controller('linkComment')
export class LinkCommentController {
  constructor(private readonly linkCommentService: LinkCommentService) {}

  @Get('/link/:linkId')
  findCommentsByLinkId(@Param('linkId', ParseIntPipe) linkId: number) {
    return this.linkCommentService.findCommentsByLinkId(linkId);
  }

  @Post('/link/:linkId')
  createComment(
    @Param('linkId', ParseIntPipe) linkId: number,
    @UserId() userId: number,
    @Body() createLinkCommentDto: CreateLinkCommentDto,
  ) {
    return this.linkCommentService.createComment(
      linkId,
      userId,
      createLinkCommentDto,
    );
  }

  @Patch('/:commentId')
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @UserId() userId: number,
    @Body() updateLinkCommentDto: UpdateLinkCommentDto,
  ) {
    return this.linkCommentService.updateComment(
      commentId,
      userId,
      updateLinkCommentDto,
    );
  }

  @Delete('/:commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.linkCommentService.deleteComment(commentId);
  }
}

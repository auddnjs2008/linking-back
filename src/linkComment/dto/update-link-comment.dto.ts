import { PartialType } from '@nestjs/mapped-types';
import { CreateLinkCommentDto } from './create-link-comment.dto';

export class UpdateLinkCommentDto extends PartialType(CreateLinkCommentDto) {}

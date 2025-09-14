import { IsString } from 'class-validator';

export class CreateLinkCommentDto {
  @IsString()
  comment: string;
}

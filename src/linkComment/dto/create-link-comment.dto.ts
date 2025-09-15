import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLinkCommentDto {
  @IsString()
  comment: string;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}

import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUrl()
  linkUrl: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

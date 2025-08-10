import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsNumber({}, { each: true })
  linkIds: number[];
}

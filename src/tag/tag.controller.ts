import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('태그')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: '모든 태그 조회 (사용 횟수 내림차순)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '태그 목록 조회 성공' })
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tagService.findAll(limit);
  }

  @Get('popular')
  @ApiOperation({ summary: '인기 태그 조회 (상위 N개)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: '인기 태그 조회 성공' })
  async findPopular(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tagService.findPopular(limit || 20);
  }

  @Get('search')
  @ApiOperation({ summary: '태그 이름으로 검색 (자동완성)' })
  @ApiQuery({ name: 'query', required: true, type: String, example: 'nest' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: '태그 검색 성공' })
  async search(
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tagService.searchByName(query, limit || 10);
  }
}

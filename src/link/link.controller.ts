import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { UpdateLinkDto } from './dto/update-link.dto';
import PagePaginationDto from 'src/common/dto/page-pagination.dto';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { UserId } from 'src/user/decorator/user-id.decorator';
import {
  LinkDetailResponseDto,
  LinkResponseDto,
} from './dto/link-response.dto';
import {
  PaginationResponseDto,
  LinkCursorPaginationResponseDto,
} from 'src/common/dto/pagination-response.dto';

@ApiTags('링크')
@Controller('link')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get()
  @ApiOperation({
    summary: '링크 목록 조회',
    description: '모든 링크를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '링크 목록 조회 성공',
    type: [LinkResponseDto],
  })
  findAll() {
    return this.linkService.findAll();
  }

  @Get('pagination')
  @ApiOperation({
    summary: '페이지네이션으로 링크 조회',
    description: '페이지 기반 페이지네이션을 사용하여 링크를 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '링크 조회 성공',
    type: PaginationResponseDto<LinkResponseDto>,
  })
  findAllByPagination(@Query() pagePaginationDto: PagePaginationDto) {
    return this.linkService.findByPagination(pagePaginationDto);
  }

  @Get('cursor-pagination')
  @ApiOperation({
    summary: '커서 페이지네이션으로 링크 조회',
    description: '커서 기반 페이지네이션을 사용하여 링크를 조회합니다.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: '마지막 데이터의 id 값',
  })
  @ApiQuery({
    name: 'order',
    required: true,
    enum: ['ASC', 'DESC'],
    description: '정렬 순서',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: '페이지당 항목 수',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '링크 목록 조회 성공',
    type: LinkCursorPaginationResponseDto, // 구체적인 타입 사용
  })
  findAllByCursor(
    @CurrentUser() user: { sub: number },
    @Query() cursorPaginationDto: CursorPagePaginationDto,
  ) {
    return this.linkService.findByCursorPagination(
      cursorPaginationDto,
      user.sub,
    );
  }

  @Get('/:id')
  @ApiOperation({
    summary: '링크 상세 조회',
  })
  @ApiResponse({
    status: 200,
    type: LinkDetailResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: { sub: number },
  ) {
    console.log(id, 'linkId');
    return this.linkService.findOne(id, currentUser.sub);
  }

  @Get('user/:userId/cursor-pagination')
  @ApiOperation({
    summary: '유저 아이디 기반의 커서 페이지네이션으로 링크 조회',
    description: '커서 기반 페이지네이션을 사용하여 링크를 조회합니다.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: '마지막 데이터의 id 값',
  })
  @ApiQuery({
    name: 'order',
    required: true,
    enum: ['ASC', 'DESC'],
    description: '정렬 순서',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: '페이지당 항목 수',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '링크 목록 조회 성공',
    type: LinkCursorPaginationResponseDto, // 구체적인 타입 사용
  })
  findAllByCursorUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() cursorPaginationDto: CursorPagePaginationDto,
    @CurrentUser() currentUser?: { sub: number },
  ) {
    return this.linkService.findByUserCursorPagination(
      cursorPaginationDto,
      userId,
      currentUser,
    );
  }

  @Post()
  @ApiOperation({
    summary: '링크 생성',
    description: '새로운 링크를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '링크 생성 성공',
    type: LinkResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  createLink(
    @Body() createLinkDto: CreateLinkDto,
    @CurrentUser() user: { sub: number },
  ) {
    return this.linkService.create(createLinkDto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '링크 수정',
    description: '기존 링크 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '링크 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '링크 수정 성공',
    type: LinkResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '링크를 찾을 수 없음',
  })
  updateLink(
    @Body() updateLinkDto: UpdateLinkDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.linkService.update(updateLinkDto, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '링크 삭제',
    description: '기존 링크를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '링크 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '링크 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '링크를 찾을 수 없음',
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.linkService.delete(id);
  }

  @Post(':id/bookmark')
  @ApiOperation({
    summary: '링크 북마크 추가',
    description: '링크를 북마크에 추가합니다.',
  })
  @ApiParam({ name: 'id', description: '링크 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '북마크 추가 성공',
  })
  createBookmark(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    return this.linkService.toggleBookmark(id, userId, true);
  }

  @Post(':id/unbookmark')
  @ApiOperation({
    summary: '링크 북마크 제거',
    description: '링크를 북마크에서 제거합니다.',
  })
  @ApiParam({ name: 'id', description: '링크 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '북마크 제거 성공',
  })
  unBookmark(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    return this.linkService.toggleBookmark(id, userId, false);
  }
}

import {
  Body,
  Controller,
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
import { GroupService } from './group.service';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { GroupCursorPaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { GroupDetailResponseDto } from './dto/group-detail-response.dto';

@ApiTags('그룹')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @ApiOperation({
    summary: '그룹 목록 조회',
    description: '모든 그룹을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '그룹 목록 조회 성공',
    type: [GroupResponseDto],
  })
  findAll() {
    return this.groupService.findAll();
  }

  @Get('cursor-pagination')
  @ApiOperation({
    summary: '커서 페이지네이션으로 그룹 조회',
    description: '커서 기반 페이지네이션을 사용하여 그룹을 조회합니다.',
  })
  @ApiQuery({ name: 'cursor', required: false, description: '커서 값' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '그룹 조회 성공',
    type: GroupCursorPaginationResponseDto,
  })
  findAllByCursor(
    @CurrentUser() user: { sub: number },
    @Query() cursorPaginationDto: CursorPagePaginationDto,
  ) {
    return this.groupService.findByCursorPagination(
      cursorPaginationDto,
      user.sub,
    );
  }

  @Get('/:id')
  @ApiOperation({
    summary: '그룹 상세 조회',
    description: '특정 그룹의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '그룹 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '그룹 조회 성공',
    type: GroupDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '그룹을 찾을 수 없음',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number },
  ) {
    return this.groupService.findItem(id, user.sub);
  }

  @Get('user/:userId/cursor-pagination')
  @ApiOperation({
    summary: '유저 아이디 기반의 커서 페이지네이션으로 그룹 조회',
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
    description: '그룹 조회 성공',
    type: GroupCursorPaginationResponseDto,
  })
  findAllByCursorUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() cursorPaginationDto: CursorPagePaginationDto,
    @CurrentUser() currentUser?: { sub: number },
  ) {
    return this.groupService.findByUserCursorPagination(
      cursorPaginationDto,
      userId,
      currentUser,
    );
  }

  @Post()
  @ApiOperation({
    summary: '그룹 생성',
    description: '새로운 그룹을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '그룹 생성 성공',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  create(
    @CurrentUser() user: { sub: number },
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupService.create(createGroupDto, user.sub);
  }

  @Patch('/:id')
  @ApiOperation({
    summary: '그룹 수정',
    description: '기존 그룹 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '그룹 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '그룹 수정 성공',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '그룹을 찾을 수 없음',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(updateGroupDto, id);
  }

  @Post(':id/bookmark')
  @ApiOperation({
    summary: '그룹 북마크 추가',
    description: '그룹을 북마크에 추가합니다.',
  })
  @ApiParam({ name: 'id', description: '그룹 ID', example: 1 })
  createBookarmk(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    return this.groupService.toggleBookmark(id, userId, true);
  }

  @Post(':id/unbookmark')
  @ApiOperation({
    summary: '그룹 북마크 제거',
    description: '그룹을 북마크에서 제거합니다.',
  })
  @ApiParam({ name: 'id', description: '그룹 ID', example: 1 })
  unBookmark(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    return this.groupService.toggleBookmark(id, userId, false);
  }
}

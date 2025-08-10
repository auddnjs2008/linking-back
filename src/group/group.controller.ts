import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GroupService } from './group.service';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { CreateGroupDto } from './dto/create-group.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get('cursor-pagination')
  findAllByCursor(
    @CurrentUser() user: { sub: number },
    @Query() cursorPaginationDto: CursorPagePaginationDto,
  ) {
    return this.groupService.findByCursorPagination(
      cursorPaginationDto,
      user.sub,
    );
  }

  @Post()
  create(
    @CurrentUser() user: { sub: number },
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupService.create(createGroupDto, user.sub);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { GroupService } from './group.service';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';

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
}

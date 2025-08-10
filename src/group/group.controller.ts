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
import { GroupService } from './group.service';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

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

  @Get('/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findItem(id);
  }

  @Post()
  create(
    @CurrentUser() user: { sub: number },
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupService.create(createGroupDto, user.sub);
  }

  @Patch('/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(updateGroupDto, id);
  }
}

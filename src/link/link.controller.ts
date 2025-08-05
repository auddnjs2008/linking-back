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
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { UpdateLinkDto } from './dto/update-link.dto';
import PagePaginationDto from 'src/common/dto/page-pagination.dto';
import { CursorPagePaginationDto } from 'src/common/dto/cursor-pagination.dto';

@Controller('link')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get()
  findAll() {
    return this.linkService.findAll();
  }

  @Get('pagination')
  findAllByPagination(@Query() pagePaginationDto: PagePaginationDto) {
    return this.linkService.findByPagination(pagePaginationDto);
  }

  @Get('cursor-pagination')
  findAllByCursor(@Query() cursorPaginationDto: CursorPagePaginationDto) {
    return this.linkService.findByCursorPagination(cursorPaginationDto);
  }

  @Post()
  createLink(
    @Body() createLinkDto: CreateLinkDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.linkService.create(createLinkDto, user.id);
  }

  @Patch(':id')
  updateLink(
    @Body() updateLinkDto: UpdateLinkDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.linkService.update(updateLinkDto, id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.linkService.delete(id);
  }
}

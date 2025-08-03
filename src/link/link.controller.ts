import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { UpdateLinkDto } from './dto/update-link.dto';

@Controller('link')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

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

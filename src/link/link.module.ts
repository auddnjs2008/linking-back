import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entity/link.entity';
import User from 'src/user/entity/user.entity';
import { CommonModule } from 'src/common/common.module';
import { LinkUserBookmark } from './entity/link-user-bookmark.entity';
import { Group } from 'src/group/entity/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link, User, LinkUserBookmark, Group]),
    CommonModule,
  ],
  providers: [LinkService],
  controllers: [LinkController],
})
export class LinkModule {}

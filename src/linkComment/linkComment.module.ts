import { Module } from '@nestjs/common';
import { LinkCommentController } from './linkComment.controller';
import { LinkCommentService } from './linkComment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkComment } from './entity/linkComment.entity';
import User from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LinkComment, User])],
  providers: [LinkCommentService],
  controllers: [LinkCommentController],
})
export class LinkCommentModule {}

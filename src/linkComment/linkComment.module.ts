import { Module } from '@nestjs/common';
import { LinkCommentController } from './linkComment.controller';
import { LinkCommentService } from './linkComment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkComment } from './entity/linkComment.entity';
import { LinkModule } from 'src/link/link.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([LinkComment]), LinkModule, UserModule],
  providers: [LinkCommentService],
  controllers: [LinkCommentController],
})
export class LinkCommentModule {}

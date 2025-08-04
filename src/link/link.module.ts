import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entity/link.entity';
import User from 'src/user/entities/user.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Link, User]), CommonModule],
  providers: [LinkService],
  controllers: [LinkController],
})
export class LinkModle {}

import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entity/link.entity';
import User from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link, User])],
  providers: [LinkService],
  controllers: [LinkController],
})
export class LinkModle {}

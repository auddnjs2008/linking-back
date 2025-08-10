import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { Link } from 'src/link/entity/link.entity';
import { CommonModule } from 'src/common/common.module';
import User from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Link, User]), CommonModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { Link } from 'src/link/entity/link.entity';
import { Group } from 'src/group/entity/group.entity';
import User from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Group, User])],
  providers: [CommonService],
  controllers: [CommonController],
  exports: [CommonService],
})
export class CommonModule {}

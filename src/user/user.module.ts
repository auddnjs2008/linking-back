import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entity/user.entity';
import { Link } from 'src/link/entity/link.entity';
import { Group } from 'src/group/entity/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Link, Group])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

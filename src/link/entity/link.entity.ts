import { BaseTable } from 'src/common/entities/base-table.entity';
import User from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LinkUserBookmark } from './link-user-bookmark.entity';
import { Group } from 'src/group/entity/group.entity';

@Entity()
export class Link extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  linkUrl: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @ManyToOne(() => User, (user) => user.createdLinks, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => LinkUserBookmark, (lub) => lub.link)
  bookmarkedUsers: LinkUserBookmark[];

  @ManyToMany(() => Group, (group) => group.linkedLinks)
  linkedGroups: Group[];
}

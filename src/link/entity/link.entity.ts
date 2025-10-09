import { BaseTable } from 'src/common/entities/base-table.entity';
import User from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LinkUserBookmark } from './link-user-bookmark.entity';
import { LinkComment } from 'src/linkComment/entity/linkComment.entity';
import { Group } from 'src/group/entity/group.entity';
import { Tag } from 'src/tag/entity/tag.entity';

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

  @Column()
  thumbnail: string;

  @ManyToMany(() => Tag, (tag) => tag.links)
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.createdLinks, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => LinkUserBookmark, (lub) => lub.link)
  bookmarkedUsers: LinkUserBookmark[];

  @ManyToMany(() => Group, (group) => group.linkedLinks)
  linkedGroups: Group[];

  @OneToMany(() => LinkComment, (comment) => comment.link)
  comments: LinkComment[];
}

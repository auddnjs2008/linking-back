import { BaseTable } from 'src/common/entities/base-table.entity';
import User from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LinkUserBookMark } from './link-user-bookmark.entity';

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

  @OneToMany(() => LinkUserBookMark, (lub) => lub.link)
  bookmarkedUsers: LinkUserBookMark[];
}
